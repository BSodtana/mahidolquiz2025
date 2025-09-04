const express = require("express");
const router = express.Router();
const db = require("../config/db");

// PATH : /questions

router.get("/:userId", async (req, res) => {
    let {userId} = req.params
  try{
    let query = await db.query("SELECT * FROM users WHERE user_id = ?", [userId])
    res.status(200).json({error: false, data: query})
  }catch(err){
    console.log(err)
    res.status(500).json({error: err})
  }
});

module.exports = router;
