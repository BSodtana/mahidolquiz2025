const express = require("express");
const router = express.Router();
const io = require("socket.io")();
const socketApi = { io: io };
const db = require("../config/db")
const dayjs = require("dayjs")
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

var CURRENT_GAME_STATUS = "WELCOME";
var CURRENT_QUESTION_OWNER = null;
var CURRENT_QUESTION_SELECTED = null;
var CURRENT_LOOP = null;
var TIME_LEFT = 0;
var interval


io.on("connection", (socket) => {
  // SOCKET IS CONNECTED
  console.log(socket.id);
  //EMIT INITIAL STATE
  io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);
  io.emit("CURRENT_QUESTION_OWNER", CURRENT_QUESTION_OWNER);
  io.emit("CURRENT_QUESTION_SELECTED", CURRENT_QUESTION_SELECTED);
  io.emit("CURRENT_LOOP", CURRENT_LOOP);

  //RESET STATES
  socket.on("RESET_ALL_STATES", async () => {
    CURRENT_GAME_STATUS = "WELCOME";
    CURRENT_QUESTION_OWNER = null;
    CURRENT_QUESTION_SELECTED = null;
    CURRENT_LOOP = null;
    clearInterval(interval)
    try {
      await db.query("UPDATE system_variables SET value = ?", [null])
      io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);
      io.emit("CURRENT_QUESTION_OWNER", CURRENT_QUESTION_OWNER);
      io.emit("CURRENT_QUESTION_SELECTED", CURRENT_QUESTION_SELECTED);
      io.emit("CURRENT_LOOP", CURRENT_LOOP);
    } catch (error) {
      console.log(error)
      io.emit("CURRENT_GAME_STATUS", "ERROR AT socket.on(reset_all_states) ON /socket/index.js")
    }
  });
  //HANDLE GAME STATUS
  socket.on("CURRENT_GAME_STATUS", (data) => {
    CURRENT_GAME_STATUS = data.CURRENT_GAME_STATUS;
    io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);
  });
  //HANDLE QUESTION OWNER
  socket.on("CURRENT_QUESTION_OWNER", async (data) => {
    CURRENT_QUESTION_OWNER = data.CURRENT_QUESTION_OWNER;
    try {
      await db.query("UPDATE system_variables SET value = ? WHERE id = ?", [data.CURRENT_QUESTION_OWNER, "CURRENT_TEAM"])
      io.emit("CURRENT_QUESTION_OWNER", CURRENT_QUESTION_OWNER);
    } catch (error) {
      console.log(error)
      io.emit("CURRENT_GAME_STATUS", "ERROR AT socket.on(current_question_owner) ON /socket/index.js")
    }
  })
  //
  socket.on("SELECT_LOOP", async (data) => {
    CURRENT_LOOP = data.SELECT_LOOP
    try {
      await db.query("UPDATE system_variables SET value = ? WHERE id = ?", [data.SELECT_LOOP, "LOOP"])
      io.emit("CURRENT_LOOP", CURRENT_LOOP)
    } catch (error) {
      io.emit("CURRENT_GAME_STATUS", "ERROR AT socket.on(select_loop) ON /socket/index.js")
    }
  })
  //HANDLE USER SELECT QUESTION
  socket.on("SELECT_QUESTION", async (data) => {
    CURRENT_QUESTION_OWNER = data.user_id
    CURRENT_QUESTION_SELECTED = data.question_id
    try {
      await db.query("UPDATE system_variables SET value = ? WHERE id = ?", [data.question_id, "CURRENT_QUESTION"])
      await db.query("UPDATE questions SET isSelected = 1 WHERE id = ?", [data.question_id])
      io.emit("CURRENT_GAME_STATUS", "AWAIT_MC")
      io.emit("CURRENT_QUESTION_OWNER", data.user_id)
      io.emit("CURRENT_QUESTION_SELECTED", data.question_id)
    } catch (error)
      console.log(error)
      io.emit("CURRENT_GAME_STATUS", "ERROR AT socket.on(select_question) ON /socket/index.js")
    }
    io.emit("CURRENT_QUESTION_SELECTED", data.question_id)
  })
  //HANDLE CURRENT STATUS EMITTION
  socket.on("EMIT_CURRENT_FROM_DB", async () => {
    try {
      let query = await db.query("SELECT * FROM system_variables")
      CURRENT_QUESTION_SELECTED = query[1].value
      CURRENT_QUESTION_OWNER = query[2].value
      CURRENT_LOOP = query[0].value

      console.log(`คำถามปัจจุบัน: ${CURRENT_QUESTION_SELECTED}`)
      console.log(`เจ้าของคำถาม: ${CURRENT_QUESTION_OWNER}`)
    } catch (err) {
      console.log(err)
    }
    io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);
    io.emit("CURRENT_QUESTION_OWNER", CURRENT_QUESTION_OWNER);
    io.emit("CURRENT_QUESTION_SELECTED", CURRENT_QUESTION_SELECTED);
  })

  //HANDLE ANSWER SUBMISSION
  socket.on("SUBMIT_ANSWER", async (data) => {
    const { userId, questionId, answer } = data;

    try {
        const [team] = await db.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [userId]);
        const [question] = await db.query("SELECT * FROM questions WHERE id = ? LIMIT 1", [questionId]);

        if (!team || !question) {
            return socket.emit("SUBMISSION_ERROR", { message: "Team or Question not found" });
        }

        const [existingAnswer] = await db.query("SELECT * FROM answer WHERE user_id = ? AND question_id = ?", [userId, questionId]);
        if (existingAnswer.length > 0) {
            return socket.emit("SUBMISSION_ERROR", { message: "Answer already submitted and graded." });
        }

        const totalTime = parseInt(question.time);
        const isFast = TIME_LEFT >= totalTime / 2;

        const correctAnswers = question.correct_answer.split('/').map(a => a.trim().toLowerCase());
        const submittedAnswer = answer.trim().toLowerCase();
        const isCorrect = correctAnswers.includes(submittedAnswer);

        let scoreForThisQuestion = 0;
        let newFlowerParts = team.flower_parts;
        const scoreMultiplier = team.flower_parts / 5.0;

        if (isCorrect) {
            scoreForThisQuestion = (question.score || 0) * scoreMultiplier;
            if (isFast) {
                newFlowerParts++;
            }
        } else {
            scoreForThisQuestion = 0;
            newFlowerParts--;
        }

        newFlowerParts = Math.max(3, Math.min(7, newFlowerParts));

        const [currentTeamState] = await db.query("SELECT score FROM teams WHERE id = ?", [userId]);
        const newTotalScore = currentTeamState[0].score + scoreForThisQuestion;

        await db.query("UPDATE teams SET score = ?, flower_parts = ? WHERE id = ?", [newTotalScore, newFlowerParts, userId]);
        await db.query("INSERT INTO answer (user_id, question_id, answer, score) VALUES (?, ?, ?, ?)", [userId, questionId, answer, scoreForThisQuestion]);

        io.emit("SCORE_UPDATE", {
            userId: userId,
            newTotalScore: newTotalScore,
            newFlowerParts: newFlowerParts
        });

        socket.emit("SUBMISSION_CONFIRMED", { success: true });

    } catch (err) {
        console.error("Error in SUBMIT_ANSWER:", err);
        socket.emit("SUBMISSION_ERROR", { message: "An error occurred during submission." });
    }
  });

  //HANDLE START AND TIME LEFT
  socket.on("START_QUESTION", async () => {
    try {
      let [question_data] = await db.query("SELECT id, time FROM questions WHERE id = ? LIMIT 1", [CURRENT_QUESTION_SELECTED])
      let time = parseInt(question_data[0].time)
      TIME_LEFT = time
      io.emit("COUNTDOWN_UNTIL", TIME_LEFT)
      interval = setInterval(async () => {
        TIME_LEFT = TIME_LEFT - 1
        console.log(`TIME LEFT: ${TIME_LEFT}`)
        io.emit("COUNTDOWN_UNTIL", TIME_LEFT)
        if (TIME_LEFT <= 0) {
          clearInterval(interval)
          setTimeout(async () => {
            try {
                CURRENT_GAME_STATUS = "WAIT";
                const questionId = CURRENT_QUESTION_SELECTED;
                const [question_details] = await db.query("SELECT * FROM questions WHERE id = ? LIMIT 1", [questionId]);
                const [teams] = await db.query("SELECT * FROM teams");

                const [latestAnswers] = await db.query(
                    `SELECT t1.user_id, t1.answer FROM answer_log t1
                     INNER JOIN (
                        SELECT user_id, MAX(createdDateTime) as maxTime
                        FROM answer_log WHERE question_id = ? GROUP BY user_id
                     ) t2 ON t1.user_id = t2.user_id AND t1.createdDateTime = t2.maxTime
                     WHERE t1.question_id = ?`,
                    [questionId, questionId]
                );
                const answersMap = new Map(latestAnswers.map(a => [a.user_id, a.answer]));

                for (const team of teams) {
                    const userId = team.id;
                    const [existingGraded] = await db.query("SELECT * FROM answer WHERE user_id = ? AND question_id = ?", [userId, questionId]);
                    if (existingGraded.length > 0) {
                        continue;
                    }

                    const loggedAnswer = answersMap.get(userId) || "";
                    let isCorrect = false;
                    if (loggedAnswer) {
                        const correctAnswers = question_details[0].correct_answer.split('/').map(a => a.trim().toLowerCase());
                        isCorrect = correctAnswers.includes(loggedAnswer.trim().toLowerCase());
                    }

                    let scoreForThisQuestion = 0;
                    let newFlowerParts = team.flower_parts;
                    const scoreMultiplier = team.flower_parts / 5.0;

                    if (isCorrect) {
                        scoreForThisQuestion = (question_details[0].score || 0) * scoreMultiplier;
                    } else {
                        scoreForThisQuestion = 0;
                        newFlowerParts--;
                    }

                    newFlowerParts = Math.max(3, Math.min(7, newFlowerParts));
                    const newTotalScore = team.score + scoreForThisQuestion;

                    await db.query("UPDATE teams SET score = ?, flower_parts = ? WHERE id = ?", [newTotalScore, newFlowerParts, userId]);
                    await db.query("INSERT INTO answer (user_id, question_id, answer, score) VALUES (?, ?, ?, ?)", [userId, questionId, loggedAnswer, scoreForThisQuestion]);

                    io.emit("SCORE_UPDATE", {
                        userId: userId,
                        newTotalScore: newTotalScore,
                        newFlowerParts: newFlowerParts
                    });
                }

                io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);

            } catch (err) {
                console.error("Error in timer-end logic:", err);
            }
          }, 5000)
        }
      }, 1000)
    } catch (err) {
      console.log(err)
    }
  })
  socket.on('event', (data) => {
    console.log(data.time); // Line 108
  });
  socket.on("FORCE_EMIT_QUESTION", async (data) => {
    CURRENT_QUESTION_SELECTED = data.question_id
    await db.query("UPDATE system_variables SET value = ? WHERE id = ?", [data.question_id, "CURRENT_QUESTION"])
    io.emit("CURRENT_GAME_STATUS", CURRENT_GAME_STATUS);
    io.emit("CURRENT_QUESTION_OWNER", CURRENT_QUESTION_OWNER);
    io.emit("CURRENT_QUESTION_SELECTED", CURRENT_QUESTION_SELECTED);
    io.emit("CURRENT_LOOP", CURRENT_LOOP);
  })
});

router.get("/", (req, res) => {
  res.status(200).json({ status: "success" });
});

module.exports = { socketApi, router };
