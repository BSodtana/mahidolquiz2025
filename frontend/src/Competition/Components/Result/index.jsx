import { PropTypes } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { GetPlayResult } from './helper';
import {Card} from "react-daisyui"

function PlayResult({CURRENT_QUESTION}) {
    const [score, setScore] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    useEffect(()=>{
        FetchSummary();
        console.log(user)
    },[CURRENT_QUESTION])

    const FetchSummary = async () =>{
        try {
            let score = await GetPlayResult(CURRENT_QUESTION, user.user_id)
            console.log(CURRENT_QUESTION, user.user_id)
            setScore(score)
        }catch(err){
            console.error(err)
        }
    }
    return (
        <div className="grid h-screen place-items-center">
          <Card className="shadow-xl">
            <Card.Body>
              <p>ทีม {score && score.owner_name}</p>
              <p className={score && score.score > 0 ?  "text-5xl text-success": "text-5xl text-error"}>{score && score.score}</p>
            </Card.Body>
          </Card>
        </div>
    );
}

PlayResult.propTypes = {
    CURRENT_QUESTION: PropTypes.string.isRequired,
}

export default PlayResult;