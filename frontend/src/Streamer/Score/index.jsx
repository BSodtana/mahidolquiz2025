import React, { useEffect, useState } from "react";
import { ScoreRanking } from "./helper";

function StreamerScore() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    getScore();
  }, []);
  const getScore = async () => {
    let score = await ScoreRanking();
    setScore(score);
  };
  return (
    <div className="grid h-screen place-items-center">
      {score &&
        score.map((data, index) => {
          return (
            <div key={index} className="grid grid-cols-3 w-5/12 m-2 items-center bg-white text-gray-700 rounded-xl p-3 opacity-100 animate__animated animate__fadeIn" style={{ animationDelay: `${(250 * index)}ms` }}>
              <div className='grid-cols-1'><p className="text-3xl"># {index + 1}</p></div>
              <div className='grid-cols-1'><p className="text-3xl">{data.owner_name}</p></div>
              <div className='grid-cols-1'><p className="text-5xl">{data.score}</p></div>
            </div>
          );
        })}
    </div>
  );
}

export default StreamerScore;