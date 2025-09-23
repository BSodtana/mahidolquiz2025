import axios from "axios"
import { ENDPOINT } from "../../../config"
import toast from "react-hot-toast"

const FetchQuestionData = async (question_id) => {
    try {
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)

        return question.data.data
    } catch (err) {
        console.log(err)
    }
}

const handleSubmission = async (user_id, current_question, textAnswer, setIsSaved, time) => {
    try {
        if(textAnswer.trim() === "") {
            toast.error("กรุณากรอกคำตอบก่อนบันทึก");
            return;
        }
        setIsSaved(true);
        let data = await GetItemRealtime(user_id);
        let time_limit = await GetQuestionInfo(current_question);
        console.log("Data : ",data)
        if(data.is_send == 0){
            toast.success("กำลังบันทึกคำตอบ... ณ เวลา " + timeFormat(time) + " กรุณารอสักครู่");
            PostItemRealtime(user_id, data.now_item, 1)
            LogData(user_id, current_question, textAnswer);
            SaveData(user_id, current_question, textAnswer);
            if(time >= (time_limit / 2)){
                // Fix EarlySend
                await EarlySend(user_id, 1, current_question);
                toast.success("บันทึกคำตอบเรียบร้อย (ได้รับ +1 ดอก หากตอบถูกต้อง)"); 
            }else{
                await EarlySend(user_id, 0, current_question);
                toast.success("บันทึกคำตอบเรียบร้อย");
            }
        }else{
            toast.error("คุณได้ส่งคำตอบไปแล้ว ไม่สามารถส่งซ้ำได้");
        }
    } catch (err) {
        setIsSaved(false);
        console.error("Submission failed:", err);
        toast.error("การบันทึกคำตอบล้มเหลว");
    }
};

const checkRejectText = async (user_id, current_question, setIsSaved) => {
    try {
        let data = await GetItemRealtime(user_id);
        if(data.is_send == 1){
            setIsSaved(true);
        }
    } catch (err) {
        console.error("Submission failed:", err);
    }
};

const GetQuestionInfo = async (current_question) => {
    try {
        let response = await axios.get(`${ENDPOINT}/flower/question/info/${current_question}/`);
        return response.data.data.time;
    }catch (err) {
        console.error(err);
    }
}

const LogData = async (user, q_id, answer) => {
    try {
        //localStorage.setItem("canvas_autosave", JSON.stringify({ question_id: q_id, user_id: user, answer: answer }))
        await axios.post(`${ENDPOINT}/answer/`, { question_id: q_id, user_id: user, answer: answer })
    } catch (err) {
        console.log(err)
    }
}

const SaveData = async (user, q_id, answer) => {
    try {
        await axios.post(`${ENDPOINT}/answer/save`, { question_id: q_id, user_id: user, answer: answer })
    } catch (err) {
        console.log(err)
    }
}

function timeFormat(duration) {
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

const FetchItems = async (user_id) => {
    try {
        let items = await axios.get(`${ENDPOINT}/items/${user_id}`)
        return items.data.data
    } catch (err) {
        console.error(err)
    }
}

const ItemBeingUsed = async (user_id, item_id, CURRENT_QUESTION) => {
    try {
        await axios.post(`${ENDPOINT}/items/`, { user_id: user_id, item_id: item_id, executed_at: CURRENT_QUESTION })
    } catch (err) {
        console.error(err)
    }
}

const GetHint = async (q_id) => {
    try {
        let hint = await axios.get(`${ENDPOINT}/items/hint/${q_id}/`)
        return hint.data
    } catch (err) {
        console.error(err)
    }
}

const EarlySend = async (user_id, is_early_submission, question_id) => {
    try{
        await axios.post(`${ENDPOINT}/flower/early/`, {user_id: user_id, is_early_submission: is_early_submission, question_id:question_id})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const checkFlowerState = async (user_id, current_question) => {
    try {
        let response = await axios.get(`${ENDPOINT}/flower/status/${user_id}/${current_question}/`);
        return response.data.data;
    }catch (err) {
        console.error(err);
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

export { FetchQuestionData, LogData, timeFormat, FetchItems, ItemBeingUsed, GetHint, handleSubmission, EarlySend, checkRejectText, GetQuestionInfo, PostItemRealtime, GetItemRealtime, SaveData }