const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all flower states
router.get("/states", async (req, res) => {
 try {
  // Use .rows to be explicit and consistent
  const { rows: flowerStates } = await db.query("SELECT team_id, current_units FROM flower_states");
  res.status(200).json({data: flowerStates});
 } catch (err) {
  console.error("Failed to retrieve flower states:", err);
  res.status(500).json({error: "Internal Server Error"});
 }
});

router.get("/states/:teamId", async (req, res) => {
    let { teamId } = req.params;
    try {
        let result = await db.query("SELECT current_units FROM flower_states WHERE team_id = ? LIMIT 1", [teamId]);
        res.status(200).json({data: result[0]})
    } catch (err) {
        console.error("Failed to retrieve team state:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/change/status/", async (req,res)=>{
  let { user_id, is_early_submission, is_rewards, question_id } = req.body
  try {
    let update_sql = `
      UPDATE answer
      SET 
        is_early_submission = ?, 
        is_rewards = ?
      WHERE user_id = ? AND question_id = ?
    `;
    let values = [is_early_submission, is_rewards, user_id, question_id];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.get("/status/:user_id/:current_question", async (req, res) => {
    let {user_id, current_question} = req.params
    try{
        let myAnswer = await db.query("SELECT is_rewards, is_early_submission FROM answer WHERE user_id = ? AND question_id = ? LIMIT 1", [user_id, current_question])
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.post("/change", async (req, res) => {
    // 1. Input Validation
    let { teamId, unitsToAdd, updateReason, questionId} = req.body;
    
    if (!teamId || unitsToAdd === undefined || !updateReason || !questionId) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    
    // 2. Start a database transaction
    let client = await db.connect();
    try {
        await client.query('BEGIN');

        // 3. Select the current units and lock the row to prevent race conditions
        let selectQuery = "SELECT current_units FROM flower_states WHERE team_id = $1 FOR UPDATE";
        let { rows: [teamState] } = await client.query(selectQuery, [teamId]);

        if (!teamState) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Team not found" });
        }

        let previousUnits = teamState.current_units;
        let newUnits = previousUnits + unitsToAdd;

        // 4. Update the flower_states table
        let updateQuery = "UPDATE flower_states SET current_units = $1 WHERE team_id = $2";
        await client.query(updateQuery, [newUnits, teamId]);

        // 5. Insert into the history table
        let historyQuery = `
            INSERT INTO flower_state_history 
            (team_id, previous_units, new_units, change_reason, question_id, changed_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `;
        await client.query(historyQuery, [teamId, previousUnits, newUnits, updateReason, questionId ]);

        // 6. Commit the transaction
        await client.query('COMMIT');

        // 7. Success Response
        res.status(200).json({
            status: "success",
            message: `Successfully updated flower units for team ${teamId} and logged history.`,
            data: { new_units: newUnits, previous_units: previousUnits }
        });

    } catch (err) {
        // Roll back the transaction if any query fails
        await client.query('ROLLBACK');
        console.error("Failed to update flower state in transaction:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        // Release the client back to the pool
        client.release();
    }
});

// Get all used items for a specific team
router.get("/items/:teamId", async (req, res) => {
    try {
        const { teamId } = req.params;
        const query = "SELECT item_type FROM item_usage WHERE team_id = $1";
        const { rows } = await db.query(query, [teamId]);

        const availableItems = rows.map(row => row.item_type);
        res.status(200).json({ data: availableItems });
    } catch (err) {
        console.error("Failed to retrieve items:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Record the usage of a flower item
router.post("/items/use", async (req, res) => {
    try {
        // Input validation: Ensure all required fields are present
        const { teamId, itemType, questionId } = req.body;
        if (!teamId || !itemType || !questionId) {
            return res.status(400).json({ error: "Missing required fields: teamId, itemType, or questionId." });
        }

        // The SQL INSERT statement with RETURNING is efficient
        const query = `
            INSERT INTO item_usage (team_id, item_type, question_id)
            VALUES ($1, $2, $3)
            RETURNING id, used_at
        `;
        const { rows: [newItem] } = await db.query(query, [teamId, itemType, questionId]);

        // Success response
        res.status(201).json({
            status: "success",
            message: "Item usage recorded successfully.",
            data: {
                id: newItem.id,
                teamId: teamId,
                itemType: itemType,
                questionId: questionId,
                usedAt: newItem.used_at
            }
        });
    } catch (err) {
        // Generic error handling
        console.error("Failed to add item usage:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/history/:teamId", async (req, res) => {
    try {
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({ error: "Missing teamId in request parameters." });
        }

        const historyQuery = `
            SELECT
                team_id,
                previous_units,
                new_units,
                change_reason,
                question_id,
                changed_at
            FROM flower_state_history
            WHERE team_id = $1
            ORDER BY changed_at DESC
        `;
        
        const { rows: historyRecords } = await db.query(historyQuery, [teamId]);

        res.status(200).json({ data: historyRecords });

    } catch (err) {
        console.error("Failed to retrieve flower history:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;