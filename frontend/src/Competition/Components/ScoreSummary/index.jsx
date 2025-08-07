import React, {useState, useEffect} from 'react';
import { Card } from 'react-daisyui';
import { ScoreRanking } from './helper';

function ScoreSummary(props) {
    let [score, setScore] = useState(false)

    useEffect(()=>{
        ScoreRanking().then((score)=>{setScore(score)})
    }, [])

        return (
         <div className="grid h-screen place-items-center text-white">
         {score && score.map((data, index)=>{
            return <>
                <Card className="grid grid-cols-3 w-5/12 m-2 items-center">
                <div className='grid-cols-1'><p># {index+1}</p></div>
                <div className='grid-cols-1'><p>{data.owner_name}</p></div>
                <div className='grid-cols-1'><p className="text-4xl">{data.score}</p></div>
                </Card>
            </>
                 
            })}
         </div>
    );
}

export default ScoreSummary;