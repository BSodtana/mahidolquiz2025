import React, { useState, useEffect } from "react";
import { FetchQuestionData } from "./helper";
import logo from "../../../src/assets/logo_Mquiz2024.png"
import { PropTypes } from "prop-types"



function StreamerWaitMc({ CURRENT_QUESTION }) {
  const [question, setQuestion] = useState()
  console.log(question);
  useEffect(() => {
    if (CURRENT_QUESTION) fetchQuestion(CURRENT_QUESTION)
  }, [CURRENT_QUESTION])

  const fetchQuestion = async (question) => {
    try {
      let data = await FetchQuestionData(question)
      setQuestion(data)
    } catch (err) {
      console.log(err)
    }
  }
  console.log(question)

  return (
    <div className="flex flex-col items-center justify-center h-screen" style={{ minHeight: '100vh'}}>
      <img src={logo} className="animate__animated animate__fadeIn pb-10 h-1/2"></img>
      <div className="p-5 rounded-lg bg-white text-gray-700  shadow-2xl text-center text-5xl opacity-70 animate__animated animate__fadeIn" style={{ animationDelay: "500ms" }}>
        {question && question.type === "FINAL"? 
        (<><span>{question.id}<br /><strong>{question.score} คะแนน</strong></span></>)
        :( question && 
        <>
          <span>{question.id} {question.level && "ระดับ"} {question.level}<br /><strong>{question.score} คะแนน</strong> | {question.time} วินาที</span>
        </>)
        }
        <br />
      </div>
    </div>
  );
}

StreamerWaitMc.propTypes = {
  CURRENT_QUESTION: PropTypes.string.isRequired
}

export default StreamerWaitMc;
