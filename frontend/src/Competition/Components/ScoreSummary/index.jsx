import React, {useState, useEffect} from 'react';
import { Card } from 'react-daisyui';
import { ScoreRanking } from './helper';

function ScoreSummary(props) {
    let [score, setScore] = useState(false)
    useEffect(()=>{
        ScoreRanking().then((score)=>{setScore(score)})
    }, [])

        return (
         <div className="overflow-x-auto h-screen flex flex-col items-center justify-center">
    <table className="table w-10/12 text-center">
        {/* Table Header */}
        <thead>
            <tr>
                <th>ลำดับ</th>
                <th>ชื่อทีม</th>
                <th>คะแนน</th>
            </tr>
        </thead>
        {/* Table Body */}
        <tbody>
            {score && score.map((data, index) => {
                const isGold = index === 0;
                const isSilver = index === 1;
                const isBronze = index === 2;

                let rowClass = '';
                let emoji = `${index + 1}`;

                if (isGold) {
                    rowClass = 'bg-yellow-200';
                    emoji = '🥇';
                } else if (isSilver) {
                    rowClass = 'bg-gray-300';
                    emoji = '🥈';
                } else if (isBronze) {
                    rowClass = 'bg-orange-200';
                    emoji = '🥉';
                }
                return (
                    <tr key={index} className={rowClass}>
                        <td className="text-2xl font-bold">{emoji}</td>
                        <td className="text-xl">{data.owner_name}</td>
                        <td className="text-xl font-bold">{data.score}</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
</div>
    );
}

export default ScoreSummary;