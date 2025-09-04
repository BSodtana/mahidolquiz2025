import React, {useState, useEffect} from 'react';
import { socket } from '../services/socket';

function StreamerSocket() {
    const [connected, setIsConnected] = useState()
    const [currentStatus, setCurrentStatus] = useState()
    const [currentQuestion, setCurrentQuestion] = useState()
    const [questionOwner, setQuestionOwner] = useState()
    const [timeLeft, setTimeLeft] = useState()
    const [loop, setLoop] = useState()

    useEffect(()=>{
        socket.on("connect", ()=>{
            setIsConnected(true)
        })
        socket.on("disconnect", ()=>{
            setIsConnected(false)
        })
        socket.on("CURRENT_GAME_STATUS", (data)=>{
            if(data === "SELECT_QUESTION") {setCurrentQuestion()}
            setCurrentStatus(data)
        })
        socket.on("CURRENT_QUESTION_OWNER", (data)=>{
          setQuestionOwner(data)
        })
        socket.on("CURRENT_LOOP", (data)=>{
          setLoop(data)
        })
        socket.on("CURRENT_QUESTION_SELECTED", (data)=>{setCurrentQuestion(data); console.log(data)});
        socket.on("COUNTDOWN_UNTIL", (data)=>{setTimeLeft(data)})
        return () =>{
            socket.off("connect")
            socket.off("disconnect")
        }
    }, [])
    return [connected, currentStatus, currentQuestion, questionOwner, timeLeft, loop];
}

export default StreamerSocket