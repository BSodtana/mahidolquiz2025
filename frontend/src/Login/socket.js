import { useEffect, useState } from "react";
import io from "socket.io-client";
import { ENDPOINT } from "../config";
import { socket } from "../services/socket";

function SocketConnection() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [src, setSrc] = useState(null)

  useEffect(() => {
    socket.on("connect")
    socket.on("disconnect")
    socket.on("meow", (data)=>{
        console.log(data)
    })

    return () =>{
        socket.off("connect")
        socket.off("disconnect")
        socket.off("canvas")
    }
  }, []);

  return [isConnected, src]
}

export { SocketConnection };
