import axios from "axios";
import { ENDPOINT } from "../../config";
const FetchAllQuestion = async () =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/list/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
}

export {FetchAllQuestion}