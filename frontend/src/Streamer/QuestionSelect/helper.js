import axios from "axios"
import { ENDPOINT } from "../../config"

const FetchQuestions = async  () => {
    try{
        let questions = await axios.get(`${ENDPOINT}/questions/`)
        console.log(questions.data)
        return questions.data
    }catch(err){
        throw err
    }
}

const GetUserDetail = async (user_id) =>{
    try{
        let data = await axios.get(`${ENDPOINT}/user/${user_id}`)
        console.log(data.data.data)
        return data.data.data
    }catch(err){
        console.log(err)
    }

}

export {FetchQuestions, GetUserDetail}