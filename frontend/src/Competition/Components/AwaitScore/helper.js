import axios from "axios"
import { ENDPOINT } from "../../../config"

const user = JSON.parse(localStorage.getItem("user"))

const GetMyAnswer = async () =>{
    try{
        let myAnswer = await axios.get(`${ENDPOINT}/answer/myans/${user.user_id}/`)
        console.log(myAnswer)
        return myAnswer.data.data
    }catch(err){
        return err
    }
}

export {GetMyAnswer}