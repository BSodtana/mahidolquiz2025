import axios from "axios"
import { ENDPOINT } from "../../../config"

const GetPlayResult = async (q_id,user_id) =>{
    try{
        let data = axios.get(`${ENDPOINT}/answer/score/${q_id}/${user_id}/`)
        return (await data).data.data
    }catch(err){
        console.log(err)
    }


}

export {GetPlayResult}