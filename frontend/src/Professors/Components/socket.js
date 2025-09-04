import { useEffect, useState } from "react";
import { socket } from "../../services/socket";

function SocketConnection() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameStatus, setGameStatus] = useState(null)
  const [questionOwner, setQuestionOwner] = useState(null)
  const [currentQuestionSelect, set_CURRENT_QUESTION_SELECTED] = useState(null)
  const [countdownUntil, set_COUNTDOWN_UNTIL] = useState(null)
  const [loop, setLoop] = useState(null)

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

    socket.on("COUNTDOWN_UNTIL", (data) => { set_COUNTDOWN_UNTIL(data) })
    return () => {
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [isConnected, gameStatus]);

  const emitValue = (status) => {
    socket.emit("CURRENT_GAME_STATUS", status)
  }

  return [isConnected, gameStatus, questionOwner, loop, currentQuestionSelect, countdownUntil, emitValue]
}

export { SocketConnection };
