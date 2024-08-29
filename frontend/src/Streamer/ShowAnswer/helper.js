import axios from "axios"
import { ENDPOINT } from "../../config"

const FetchAnswer = async (q_id) => {
    try{
        let ans = await axios.get(`${ENDPOINT}/answer/score/answers/${q_id}/`)
        return ans.data.data
    }catch(err){
        console.error(err);
    }
        
}

const FetchScore = async (q_id) => {
    try{
        let answers = await axios.get(`${ENDPOINT}/answer/score/${q_id}/`)
        return answers.data.data
    }catch(err){
        console.error(err)
    }
}

const FetchQuestionData = async (question_id) =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
} 


export {FetchAnswer, FetchScore, FetchQuestionData}