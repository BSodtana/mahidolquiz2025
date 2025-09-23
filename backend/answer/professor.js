const express = require("express");
const router = express.Router();
const db = require("../config/db");

// path: /answer/score
//SCORING
router.get("/answers/:current_question", async (req,res)=>{
    let {current_question} = req.params
    console.log(req.body)
 try{
  let userAnswer = await db.query("SELECT answer.user_id, owner_name, subrole, answer, question_id, createdDateTime FROM answer JOIN users ON users.user_id = answer.user_id WHERE question_id = ?", [current_question])
  res.status(200).json({data: userAnswer})
 }catch(err){
  console.log(err)
 } 
})

router.post("/setscore", async (req,res)=>{
  let { question_id, user_id, score, flower } = req.body

  if (!question_id || !user_id || score === undefined || !flower) {
    return res.status(400).json({ status: "error", message: "Missing required parameters: question_id, user_id, score, or flower." });
  }

  try {
    let flower_multiplier = flower / 5.0;
    let flower_modified_score = score * flower_multiplier;
    let update_sql = `
      UPDATE answer
      SET 
        score = ?, 
        flower_modified_score = ?,
        flower_no = ?
      WHERE user_id = ? AND question_id = ?
    `;

    let values = [score, flower_modified_score, flower, user_id, question_id];

    await db.query(update_sql, values);

    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.get("/summary", async (_req, res) => {
  try {
    const score = await db.query(
      `SELECT
        u.user_id,
        u.owner_name,
        COALESCE(scores.total_score, 0) AS score,
        COALESCE(fs.current_units, 0) AS flower_units,
        COALESCE(items.items_used, '') AS items_used
      FROM users AS u
      LEFT JOIN (
        SELECT user_id, SUM(flower_modified_score) AS total_score
        FROM answer
        GROUP BY user_id
      ) AS scores ON scores.user_id = u.user_id
      LEFT JOIN flower_states AS fs ON fs.team_id = u.user_id
      LEFT JOIN (
        SELECT
          team_id,
          GROUP_CONCAT(
            CASE
              WHEN (item_type = 'ADD'     AND is_used < 2)
                OR (item_type = 'REVIVE' AND is_used < 1)
                OR (item_type = 'SHIELD' AND is_used < 1)
              THEN item_type
              ELSE NULL
            END
            ORDER BY item_type SEPARATOR ','
          ) AS items_used
        FROM item_usage
        GROUP BY team_id
      ) AS items ON items.team_id = u.user_id
      WHERE COALESCE(fs.current_units, 0) > 0
      ORDER BY score DESC`
    );

    res.status(200).json({ status: "success", score });
  } catch (err) {
    res.status(500).json({ status: "error", detail: err });
  }
});


router.get("/:question_id", async (req,res)=>{
    let {question_id} = req.params
    try{
        let q_data = await db.query("SELECT correct_answer, correct_answer_description, correct_answer_photo FROM questions WHERE id = ?", [question_id])
        let score = await db.query("SELECT users.user_id, users.owner_name, answer.flower_modified_score AS score FROM answer JOIN users ON users.user_id = answer.user_id WHERE answer.question_id = ?", [question_id])
        res.status(200).json({success: true, data: {question_data: q_data, score: score}})
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, data: err})
    }
})

router.get("/:question_id/:user_id", async (req,res)=>{
    let {question_id, user_id} = req.params
    if(!question_id) res.status(400).json({success: false, reason: "ไม่ได้รับ question_id เป็น request paramater"})
    if(!user_id) res.status(400).json({success: false, reason: "ไม่ได้รับ user_id เป็น request paramater"})
    try{
        let score = await db.query("SELECT users.user_id, users.owner_name, answer.flower_modified_score AS score FROM answer JOIN users ON users.user_id = answer.user_id WHERE answer.question_id = ? AND users.user_id = ? LIMIT 1", [question_id, user_id])
        res.status(200).json({status: "success", data: score[0]})
    }catch(err){
        res.status(500).json({error: true, detail: err})
    }
})


module.exports = router;
