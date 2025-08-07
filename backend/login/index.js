const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  res.status(200).json({ page: "/auth" });
});

router.post("/", async (req, res) => {
  let { username, password } = req.body;
  console.log("Login attempt with username:");
  if (!username || !password) {
    res.status(400).json({
      success: false,
      reason: "both username and password are required",
    });
  }
  if (username && password) {
    let query = await db.query(
      "SELECT username, password FROM users WHERE username = ? AND password = ? LIMIT 1",
      [username, password]
    );
    if (query.length === 0)
      res
        .status(401)
        .json({ success: false, reason: "username or password is incorrect" });
    if (query.length === 1) {
      let userData = await db.query(
        "SELECT user_id, username, role, owner_name, subrole FROM users WHERE username = ?",
        [username]
      );
      res.status(200).json({ success: true, reason: "", data: userData[0] });
    }
  }
});

module.exports = router;
