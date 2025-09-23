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
  const { teamId } = req.params;
  const DEFAULT_UNITS = 5;

  try {
    const result = await db.query(
      "SELECT current_units, now_item, is_send FROM flower_states WHERE team_id = ? LIMIT 1",
      [teamId]
    );

    if (!result || !result.length) {
      await db.query(
        `INSERT INTO flower_states (team_id, current_units, updated_at, update_reason, now_item, is_send)
         VALUES (?, ?, NOW(), NULL, 'NONE', 0)`,
        [teamId, DEFAULT_UNITS]
      );

      return res.status(200).json({
        data: { current_units: DEFAULT_UNITS, now_item: "NONE", is_send: 0 },
      });
    }

    res.status(200).json({ data: result[0] });
  } catch (err) {
    console.error("Failed to retrieve team state:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/change/status/", async (req,res)=>{
  let { user_id, is_early_submission, is_rewards, flower_no, question_id } = req.body
  try {
    let update_sql = `
      UPDATE answer
      SET 
        is_early_submission = ?, 
        is_rewards = ?,
        flower_no = ?
      WHERE user_id = ? AND question_id = ?
    `;
    let values = [is_early_submission, is_rewards, flower_no, user_id, question_id];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.post("/early/", async (req,res)=>{
  let { user_id, is_early_submission, question_id } = req.body
  try {
    let update_sql = `
      UPDATE answer
      SET 
        is_early_submission = ?
      WHERE user_id = ? AND question_id = ?
    `;
    let values = [is_early_submission, user_id, question_id];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.post("/use/item/", async (req,res)=>{
  let { user_id, item_used, question_id } = req.body
  try {
    let update_sql = `
      UPDATE answer
      SET 
        item_used = ?
      WHERE user_id = ? AND question_id = ?
    `;
    let values = [item_used, user_id, question_id];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.post("/use/item/realtime", async (req,res)=>{
  let { user_id, item_used, is_send } = req.body
  try {
    let update_sql = `
      UPDATE flower_states
      SET 
        now_item = ?,
        is_send = ?
      WHERE team_id = ?
    `;
    let values = [item_used, is_send, user_id];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.get("/get/item/realtime/:user_id", async (req, res) => {
    let { user_id } = req.params
    try{
        let myAnswer = await db.query("SELECT now_item, is_send, current_units FROM flower_states WHERE team_id = ? LIMIT 1", user_id)
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.get("/status/:user_id/:current_question", async (req, res) => {
    let {user_id, current_question} = req.params
    try{
        let myAnswer = await db.query("SELECT is_rewards, is_early_submission, flower_no, is_protect FROM answer WHERE user_id = ? AND question_id = ? LIMIT 1", [user_id, current_question])
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.get("/status2/:user_id/:current_question", async (req, res) => {
    let {user_id, current_question} = req.params
    try{
        let myAnswer = await db.query("SELECT flower_modified_score FROM answer WHERE user_id = ? AND question_id = ? LIMIT 1", [user_id, current_question])
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.get("/status3/:user_id", async (req, res) => {
    let {user_id} = req.params
    try{
        let question = await db.query("SELECT value FROM system_variables WHERE id = ? LIMIT 1", ["CURRENT_QUESTION"])
        let currentQuestion = question[0].value
        let myAnswer = await db.query("SELECT is_protect FROM answer WHERE user_id = ? AND question_id = ? LIMIT 1", [user_id, currentQuestion])
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.post("/reset/flower", async (req, res) => {
    try {
        let { flower_reset, now_item, is_send } = req.body;
        await db.query(`UPDATE flower_states SET current_units = ?, now_item = ?, is_send = ?`, [flower_reset, now_item, is_send]);
        res.status(200).json({ message: 'All flower units updated' });
    } catch (err) {
        console.error('Database update failed:', err);
        res.status(500).json({ error: 'Failed to update flower units.' });
    }
});

router.post("/reset2/flower", async (req, res) => {
    try {
        let { now_item, is_send } = req.body;
        await db.query(`UPDATE flower_states SET now_item = ?, is_send = ?`, [now_item, is_send]);
        res.status(200).json({ message: 'All flower units updated' });
    } catch (err) {
        console.error('Database update failed:', err);
        res.status(500).json({ error: 'Failed to update flower units.' });
    }
});

router.post("/reset/item", async (req, res) => {
    try {
        let { add } = req.body;
        // Corrected SQL syntax to use a parameterized query placeholder
        await db.query(`
          UPDATE item_usage
          SET is_used = ?
          WHERE item_type = 'ADD';`, [add]);
        res.status(200).json({ message: 'All flower units updated' });
    } catch (err) {
        console.error('Database update failed:', err);
        res.status(500).json({ error: 'Failed to update flower units.' });
    }
});

// Need fix transaction
router.post("/change", async (req, res) => {
    let { user_id, b_flower,a_flower, text, question_id } = req.body
    try {
        let sql = `
        UPDATE flower_states
            SET
                current_units = ?,
                updated_at = NOW()
            WHERE team_id = ?
        `;
        let values = [a_flower, user_id];
        await db.query(sql, values);
        
        let update_history_sql = `
            INSERT INTO flower_state_history (team_id, previous_units, new_units, change_reason, question_id)
            VALUES (?, ?, ?, ?, ?)
            `;
        let history_values = [user_id, b_flower, a_flower, text, question_id];
        await db.query(update_history_sql, history_values);    
        res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
        console.error("Database update error:", err);
        res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
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
router.post("/fetch/item/", async (req,res)=>{
    let { user_id, item_type, question_id, is_used } = req.body
    try {
        let update_sql = `
            UPDATE item_usage
            SET 
                is_used = ?, 
                question_id = ?
            WHERE team_id = ? AND item_type = ?
        `;
        let values = [is_used, question_id, user_id, item_type];
        await db.query(update_sql, values);
        res.status(200).json({ status: "success", message: "Scores updated successfully." });
    } catch(err) {
        console.error("Database update error:", err);
        res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
    }
});

router.get("/get/item/:user_id/:item_type", async (req, res) => {
    let {user_id, item_type} = req.params
    try{
        let myAnswer = await db.query("SELECT is_used FROM item_usage WHERE team_id = ? AND item_type = ? LIMIT 1", [user_id,item_type]);
        res.status(200).json({data: myAnswer[0]})
    }catch(err){
        console.log(err)
    } 
});

router.get("/get/allitem", async (req, res) => {
    try {
        // Step 1: Pull all team_ids first. THIS IS THE FLAWED APPROACH.
        const [users] = await db.query("SELECT user_id AS team_id FROM users");

        const allTeamItems = {};

        // Step 2: Loop through each team to query the database individually.
        for (const user of users) {
            const team_id = user.team_id;

            // Step 3: Execute a separate query for each team.
            const [itemUsageRows] = await db.query(`
                SELECT
                    item_type,
                    is_used
                FROM
                    item_usage
                WHERE
                    team_id = ?
                AND
                    item_type IN ('ADD', 'REVIVE', 'SHIELD')
            `, [team_id]);

            const items = {};
            itemUsageRows.forEach(row => {
                items[row.item_type] = row.is_used;
            });

            allTeamItems[team_id] = items;
        }

        res.status(200).json({ status: "success", data: allTeamItems });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ status: "error", detail: "Internal Server Error" });
    }
});

router.get("/question/info/:current_question", async (req,res)=>{
  try{
    let { current_question } = req.params
    let question  = await db.query("SELECT score, time FROM questions WHERE id = ? LIMIT 1", [current_question])
    res.status(200).json({status: "success", data: question[0]})
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})

router.post("/update", async (req,res)=>{
  let { user_id , is_early_submission, is_protect } = req.body
  try {
    let question = await db.query("SELECT value FROM system_variables WHERE id = ? LIMIT 1", ["CURRENT_QUESTION"])
    let currentQuestion = question[0].value
    let update_sql = `
      UPDATE answer
      SET 
        is_early_submission = ?,
        is_protect = ?
      WHERE user_id = ? AND question_id = ?
    `;
    let values = [is_early_submission, is_protect, user_id, currentQuestion];
    await db.query(update_sql, values);
    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
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
