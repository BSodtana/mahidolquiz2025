const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all flower states
router.get("/flower/states", async (req, res) => {
 try {
  // Use .rows to be explicit and consistent
  const { rows: flowerStates } = await db.query("SELECT team_id, current_units FROM flower_states");
  res.status(200).json({data: flowerStates});
 } catch (err) {
  console.error("Failed to retrieve flower states:", err);
  res.status(500).json({error: "Internal Server Error"});
 }
});

// Get flower item state for a specific team
router.get("/flower/states/:teamId", async (req, res) => {
    try {
        const { teamId } = req.params;
        // Parameterized query using $1 and passing the value as an array
        const { rows: [teamState] } = await db.query("SELECT current_units FROM flower_states WHERE team_id = $1", [teamId]);

        if (teamState) {
            res.status(200).json({ data: teamState });
        } else {
            res.status(404).json({ error: "Team not found" });
        }
    } catch (err) {
        console.error("Failed to retrieve team state:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/flower/change", async (req, res) => {
    // 1. Input Validation
    const { teamId, unitsToAdd, updateReason, questionId} = req.body;
    
    if (!teamId || unitsToAdd === undefined || !updateReason || !questionId) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    
    // 2. Start a database transaction
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 3. Select the current units and lock the row to prevent race conditions
        const selectQuery = "SELECT current_units FROM flower_states WHERE team_id = $1 FOR UPDATE";
        const { rows: [teamState] } = await client.query(selectQuery, [teamId]);

        if (!teamState) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Team not found" });
        }

        const previousUnits = teamState.current_units;
        const newUnits = previousUnits + unitsToAdd;

        // 4. Update the flower_states table
        const updateQuery = "UPDATE flower_states SET current_units = $1 WHERE team_id = $2";
        await client.query(updateQuery, [newUnits, teamId]);

        // 5. Insert into the history table
        const historyQuery = `
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
router.get("/flower/items/:teamId", async (req, res) => {
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
router.post("/flower/items/use", async (req, res) => {
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

router.get("/flower/history/:teamId", async (req, res) => {
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