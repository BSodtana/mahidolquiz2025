const express = require("express");
const router = express.Router();
const db = require("../config/db");

//ANSWER LOG
// path : /items
/*router.get("/hint/:q_id", async (req,res)=>{
    let {q_id} = req.params
    try{
        let hint = await db.query("SELECT * FROM hints WHERE question_id = ? LIMIT 1", [q_id])
        res.status(200).json({data: hint[0]})
    }catch(err){
        res.status(500).json({data: null, error: err})
        console.log(err)
    }
})*/

/*router.get("/executed/:question_id", async (req,res)=>{
    let {question_id} = req.params
    try{
        let items = await db.query("SELECT user_id, item_id FROM items WHERE executed_at = ?", [question_id])
        let executedStreak = await db.query("SELECT user_id FROM items WHERE item_id = ? AND item_used = 1", ["streak"])
        let getSequence = await db.query("SELECT sequence FROM questions WHERE id = ?", [question_id])
        let sequence = getSequence[0].sequence
        let teamExecutedStreak = []
        for(let i = 0; i < executedStreak.length; i++){
            teamExecutedStreak.push(executedStreak[i].user_id)
        }
        console.log(`ทีมใช้ Streak: ${teamExecutedStreak}`)
        console.log(teamExecutedStreak)
        let teamWithStreak = []
        let streakCriteriaIsMet
        if(executedStreak.length > 0) streakCriteriaIsMet = await db.query("SELECT DISTINCT(user_id) AS user_id, questions.id, SUM(answer.score) AS score FROM answer JOIN questions ON questions.id = answer.question_id WHERE user_id IN (?) AND questions.sequence <= ? GROUP BY user_id", [teamExecutedStreak, sequence])
        for(let i = 0; i<streakCriteriaIsMet?.length; i++){
            if(parseInt(streakCriteriaIsMet[i].score) >= sequence*25.00){
                teamWithStreak.push(streakCriteriaIsMet[i].user_id)
            }
        }
        res.status(200).json({items: items, streak_active: teamWithStreak})
    }catch(err){
        console.log(err)
        res.status(500).json({data: null, error: err})
    }
}, [])*/
router.get("/:user_id", async (req,res)=>{
 let {user_id} = req.params
 try{
  let items = await db.query("SELECT * FROM items WHERE user_id = ?", [user_id])
  res.status(200).json({data: items})
 }catch(err){
  console.log(err)
 } 
})

/*router.post("/", async (req,res)=>{
    let {user_id, item_id, executed_at} = req.body
    console.log(req.body)
    try{
        await db.query("UPDATE items SET item_used = 1, executed_at = ? WHERE user_id = ? AND item_id = ?", [executed_at, user_id, item_id])
        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        res.status(500).json({detail: "INTERNAL SERVER ERROR"})
    }
})*/

module.exports = router;
