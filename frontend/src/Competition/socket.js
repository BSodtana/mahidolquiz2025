import React, {useEffect, useMemo, useState} from 'react';
import { socket } from "../services/socket";

function SocketConnection() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [CURRENT_GAME_STATUS, set_CURRENT_GAME_STATUS] = useState();
    const [CURRENT_QUESTION_OWNER, set_CURRENT_QUESTION_OWNER] = useState();
    const [CURRENT_QUESTION_SELECTED, set_CURRENT_QUESTION_SELECTED] = useState();
    const [COUNTDOWN_UNTIL, set_COUNTDOWN_UNTIL] = useState()
    
    useEffect(()=>{
        socket.on("connect", ()=>{setIsConnected(socket.connected)});
        socket.on("disconnect", ()=>{setIsConnected(socket.connected)});
        socket.on("CURRENT_GAME_STATUS", (data)=>{if(data === "SELECT_QUESTION") {set_CURRENT_QUESTION_SELECTED()} set_CURRENT_GAME_STATUS(data)});
        socket.on("CURRENT_QUESTION_OWNER", (data)=>{set_CURRENT_QUESTION_OWNER(data)});
        socket.on("CURRENT_QUESTION_SELECTED", (data)=>{set_CURRENT_QUESTION_SELECTED(data)});
        socket.on("COUNTDOWN_UNTIL", (data)=>{set_COUNTDOWN_UNTIL(data)})

        return ()=>{
            socket.off("connect")
            socket.off("disconnect")
            socket.off("CURRENT_GAME_STATUS")
            socket.off("CURRENT_QUESTION_OWNER")
            socket.off("CURRENT_QUESTION_SELECTED")
            socket.off("COUNTDOWN_UNTIL")
        }
    }, [isConnected, CURRENT_GAME_STATUS, CURRENT_QUESTION_OWNER, COUNTDOWN_UNTIL, CURRENT_QUESTION_SELECTED])

    const emitSelectQuestion = async (id, question_id) => {
        socket.emit("SELECT_QUESTION", {team_id: id, question_id: question_id})
    }

    return [isConnected, CURRENT_GAME_STATUS, CURRENT_QUESTION_OWNER, CURRENT_QUESTION_SELECTED, COUNTDOWN_UNTIL, emitSelectQuestion]
}

export default SocketConnection;