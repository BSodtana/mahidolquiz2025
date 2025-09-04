const express = require("express");
const router = express.Router();
const db = require("../config/db");

const professor = require("./professor")

//ANSWER LOG
// path : /answer
//delay autosave in answer_log
router.post("/", async (req, res) => {
    let {question_id, user_id, answer} = req.body;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  try{
    await delay(5000);
    await db.query("INSERT INTO answer_log (user_id, question_id, answer) VALUES (?,?,?)", [user_id, question_id, answer])
    res.status(200).json({error: false, success: true})
  }catch(err){
    console.log(err)
    res.status(500).json({error: err})
  }
});

router.get("/myans/:user_id", async (req,res)=>{
 let {user_id} = req.params
 try{
  let question = await db.query("SELECT value FROM system_variables WHERE id = ? LIMIT 1", ["CURRENT_QUESTION"])
  let currentQuestion = question[0].value
  let myAnswer = await db.query("SELECT answer, createdDateTime FROM answer WHERE user_id = ? AND question_id = ? LIMIT 1", [user_id, currentQuestion])
  res.status(200).json({data: myAnswer[0]})
 }catch(err){
  console.log(err)
 } 
})

router.use("/score", professor)

module.exports = router;
