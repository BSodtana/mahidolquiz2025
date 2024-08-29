import io from "socket.io-client"
import { ENDPOINT } from "../config"

export const socket = io(ENDPOINT)