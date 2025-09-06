import axios from "axios"
import { ENDPOINT } from "../../config";
function timeFormat(duration)
{   
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

const FetchQuestionData = async (question_id) =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
}

const FetchUserAnswer = async (question_id) => {
    console.log(question_id)
    try{
        let answers = await axios.get(`${ENDPOINT}/answer/score/answers/${question_id}/`)
        return answers.data.data
    }catch(err){
        console.log(err)
        throw err
    }
}

const UpdateScore = async (user_id, score, question_id, flower) =>{
    try{
        await axios.post(`${ENDPOINT}/answer/score/setscore/`, {question_id: question_id,user_id: user_id, score: score, flower:flower})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const GetUserItems = async (q_id) => {
    try{
        let data = await axios.get(`${ENDPOINT}/items/executed/${q_id}/`)
        return data.data
    }catch(err){
        console.error(err)
    }
}

const GetUserScore = async (q_id) => {
    try{
        let data = await axios.get(`${ENDPOINT}/answer/score/${q_id}/`)
        return data.data.data.score
    }catch(err){
        console.error(err)
    }
}

const getFlowerState = async (user_id) => {
    try {
        let data = await axios.get(`${ENDPOINT}/flower/states/${user_id}/`);
        return data.data.data.current_units;
    }catch (err) {
        console.error(err);
    }
}

const changeFlowerState = async (teamId, unitsToAdd, updateReason, questionId) => {
    try{
        await axios.post(`${ENDPOINT}/flower/change/`, {teamId: teamId,unitsToAdd: unitsToAdd, updateReason: updateReason, questionId:questionId})
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

const updateFlowerStatus = async (user_id, is_early_submission, is_rewards, question_id) => {
    try{
        await axios.post(`${ENDPOINT}/flower/change/status/`, {user_id: user_id,is_early_submission: is_early_submission, is_rewards: is_rewards, question_id:question_id})
    }catch(err){
        console.log(err)
        throw err;
    }
}

export {timeFormat, FetchQuestionData, FetchUserAnswer, UpdateScore, GetUserItems, GetUserScore, getFlowerState, changeFlowerState, checkFlowerState, updateFlowerStatus}