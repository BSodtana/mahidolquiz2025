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
        flower_modified_score = ?
      WHERE user_id = ? AND question_id = ?
    `;

    let values = [score, flower_modified_score, user_id, question_id];

    await db.query(update_sql, values);

    res.status(200).json({ status: "success", message: "Scores updated successfully." });
  } catch(err) {
    console.error("Database update error:", err);
    res.status(500).json({ status: "error", message: "An internal server error occurred.", error: err.message });
  }
});

router.get("/summary", async (req,res)=>{
    try{
        let score = await db.query("SELECT users.user_id, users.owner_name, SUM(answer.score) AS score FROM answer JOIN users ON users.user_id = answer.user_id GROUP BY answer.user_id ORDER BY SUM(answer.score) DESC")
        res.status(200).json({status: "success", score: score})
    }catch(err){
        res.status(500).json({status: "error", detail: err})
    }
})

router.get("/:question_id", async (req,res)=>{
    let {question_id} = req.params
    try{
        let q_data = await db.query("SELECT correct_answer, correct_answer_description, correct_answer_photo FROM questions WHERE id = ?", [question_id])
        let score = await db.query("SELECT users.user_id, users.owner_name, answer.score AS score FROM answer JOIN users ON users.user_id = answer.user_id WHERE answer.question_id = ?", [question_id])
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
        let score = await db.query("SELECT users.user_id, users.owner_name, answer.score AS score FROM answer JOIN users ON users.user_id = answer.user_id WHERE answer.question_id = ? AND users.user_id = ? LIMIT 1", [question_id, user_id])
        res.status(200).json({status: "success", data: score[0]})
    }catch(err){
        res.status(500).json({error: true, detail: err})
    }
})


module.exports = router;