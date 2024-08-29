import { useEffect, useState } from "react";
import io from "socket.io-client";
import { ENDPOINT } from "../../config";
import { socket } from "../../services/socket";

function SocketConnection() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameStatus, setGameStatus] = useState(null)
  const [questionOwner, setQuestionOwner] = useState(null)
  const [loop, setLoop] = useState(null)
  const [currentQuestionSelect, set_CURRENT_QUESTION_SELECTED] = useState(null)



  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true)
    })
    socket.on("disconnect", () => {
      setIsConnected(false)
    })
    socket.on("CURRENT_GAME_STATUS", (data) => {
      setGameStatus(data)
    })
    socket.on("CURRENT_QUESTION_OWNER", (data) => {
      setQuestionOwner(data)
    })
    socket.on("CURRENT_LOOP", (data) => {
      setLoop(data)
    })
    socket.on("CURRENT_QUESTION_SELECTED", (data) => {
      set_CURRENT_QUESTION_SELECTED(data)
    });


    return () => {
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [isConnected, gameStatus]);

  const emitValue = (status) => {
    socket.emit("CURRENT_GAME_STATUS", status)
  }

  const resetGameState = (status) => {
    socket.emit("RESET_ALL_STATES")
  }
  const emitQuestionOwner = (status) => {
    socket.emit("CURRENT_QUESTION_OWNER", status)
  }
  const emitLoop = (status) => {
    socket.emit("SELECT_LOOP", status)
  }
  const emitStart = () => {
    socket.emit("START_QUESTION")
  }
  const fetchGameState = () => {
    socket.emit("EMIT_CURRENT_FROM_DB")
  }
  const emitQuestion = (question_id) => {
    socket.emit("FORCE_EMIT_QUESTION", { question_id: question_id })
  }

  return [isConnected, gameStatus, questionOwner, loop, emitValue, emitQuestionOwner, resetGameState, fetchGameState, emitLoop, emitStart, emitQuestion, currentQuestionSelect]
}

export { SocketConnection };
