import axios from "axios"
import { ENDPOINT } from "../../../config"

const FetchQuestionData = async (question_id) => {
    try {
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)

        return question.data.data
    } catch (err) {
        console.log(err)
    }
}

const LogData = async (user, q_id, answer) => {
    try {
        localStorage.setItem("canvas_autosave", JSON.stringify({ question_id: q_id, user_id: user, answer: answer }))
        await axios.post(`${ENDPOINT}/answer/`, { question_id: q_id, user_id: user, answer: answer })
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
export { FetchQuestionData, LogData, timeFormat, FetchItems, ItemBeingUsed, GetHint }