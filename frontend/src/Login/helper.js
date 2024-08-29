import axios from "axios"
import {ENDPOINT} from "../config"
const handleLogin = async (e) =>{
    try{
        if(!e.target.username.value || !e.target.password.value) throw "AN ERROR HAS OCCURED"
        if(e.target.username.value && e.target.password.value){
            let processLogin = await axios.post(`${ENDPOINT}/login/`, {username: e.target.username.value, password: e.target.password.value})
            return processLogin.data
        }
    }catch(err){
        throw ({success: false, reason: err})
    }

}

export {handleLogin}