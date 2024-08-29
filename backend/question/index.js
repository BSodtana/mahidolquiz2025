const express = require("express");
const router = express.Router();
const db = require("../config/db");

// PATH : /questions

router.get("/", async (req, res) => {
  try{
    let queryLoop = await db.query("SELECT id, value FROM system_variables WHERE id = ?", ["loop"])
    let loop = queryLoop[0].value
    let query = await db.query("SELECT * FROM questions WHERE section = ?", [loop])
    res.status(200).json({error: false, data: query})
  }catch(err){
    console.log(err)
    res.status(500).json({error: err})
  }
});

router.get("/list", async (req,res)=>{
  try{
    let question  = await db.query("SELECT id, score, time, text FROM questions")
    res.status(200).json({status: "success", data: question})
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})

router.get("/:question_id", async (req,res)=>{
  let {question_id} = req.params
  try{
    let query = await db.query("SELECT * FROM questions WHERE id = ? LIMIT 1", [question_id])
    res.status(200).json({data: query[0]})
  }catch(err){
    console.log(err)
    res.status(500).json({error: err})
  }
})
module.exports = router;
