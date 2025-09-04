import axios from "axios"
import { ENDPOINT } from "../../../config"

const FetchQuestions = async  () => {
    try{
        let questions = await axios.get(`${ENDPOINT}/questions/`)
        console.log(questions.data)
        return questions.data
    }catch(err){
        throw err
    }
}

const SelectQuestion = async (team_id, question_id) =>{
}

export {FetchQuestions, SelectQuestion}