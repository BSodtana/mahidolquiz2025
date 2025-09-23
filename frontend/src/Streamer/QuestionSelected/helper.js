import axios from "axios"
import { ENDPOINT } from "../../config"

const FetchQuestionData = async (question_id) =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
} 

const FetchScoreSummary = async () => {
    try {
        let response = await axios.get(`${ENDPOINT}/answer/score/summary/`);
        return response.data.score;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export {FetchQuestionData, FetchScoreSummary}
