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

const PostItemRealtime = async (user_id, item_used, is_send) => {
    try{
        await axios.post(`${ENDPOINT}/flower/use/item/realtime`, {user_id: user_id, item_used: item_used, is_send: is_send})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const GetItemRealtime = async (user_id) => {
    try {
        let data = await axios.get(`${ENDPOINT}/flower/get/item/realtime/${user_id}/`);
        return data.data.data;
    }catch (err) {
        console.error(err);
    }
}

const CheckProtect = async (user_id) => {
    try {
        let response = await axios.get(`${ENDPOINT}/flower/status3/${user_id}/`);
        return response.data.data;
    }catch (err) {
        console.error(err);
    }
}

const PostEarlySubmission = async (user_id, is_early_submission, is_protect) => {
    try{
        await axios.post(`${ENDPOINT}/flower/update/`, {user_id: user_id, is_early_submission: is_early_submission, is_protect: is_protect})
    }catch(err){
        console.log(err)
        throw err;
    }
}

export {GetMyAnswer, PostItemRealtime, GetItemRealtime, PostEarlySubmission, CheckProtect}