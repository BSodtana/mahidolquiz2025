const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
// SOCKET LOGIC
var http = require("http").Server(app);
const socket = require("./socket")
const socketHandler = socket.socketApi
socketHandler.io.attach(http, { cors: { origin: "*" } })
app.use(
  cors({
    origin: "*",
    // origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://10.83.217.233:5173", "http://10.83.218.1:5173"],
  })
);
const port = process.env.PORT || 8080;
const logger = morgan("dev");
app.use(logger);
app.use("/socket", socket.router)

const login = require("./login")
const questions = require("./question")
const answer = require("./answer")
const user = require("./user")
const item = require("./item")
const photo = require("./static")

app.use("/login", login)
app.use("/questions", questions)
app.use("/answer", answer)
app.use("/user", user)
app.use("/items", item)
app.use("/static", photo)

app.get("/", (req, res) => {
  res.status(200).json({ status: `Server is running at port ${port}` });
});

http.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
