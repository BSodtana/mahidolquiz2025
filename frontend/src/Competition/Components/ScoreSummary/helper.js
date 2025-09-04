import axios from "axios"
import { ENDPOINT } from "../../../config"

const ScoreRanking = async () =>{
    try{
        let score = await axios.get(`${ENDPOINT}/answer/score/summary/`)
        console.log(score)
        return score.data.score
    }catch(err){
        throw err
    }
}

export {ScoreRanking}