const express = require("express");
const router = express.Router();

router.get("*", express.static("static"))

module.exports = router;