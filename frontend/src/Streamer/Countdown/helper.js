import { ENDPOINT } from "../../config"
import axios from "axios"

const FetchQuestionData = async (question_id) =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
} 

export {FetchQuestionData}