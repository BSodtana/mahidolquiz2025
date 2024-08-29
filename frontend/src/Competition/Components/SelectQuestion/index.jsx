import React, { useState, useEffect } from "react";
import { FetchQuestions } from "./helper";
import { Button } from "react-daisyui";
import { PropTypes } from "prop-types";

function QuestionSelector({socket, CURRENT_QUESTION_OWNER}) {
  const [question, setQuestion] = useState()
  const [typeArray, setTypeArray] = useState(["ANATOMY", "PHYSIOLOGY", "GENERAL KNOWLEDGE", "BIOCHEMISTRY", "MICROBIOLOGY AND INFECTIOUS DISEASES"])

  const user = JSON.parse(localStorage.getItem("user"))
  useEffect(() => {
      getQuestion();
  }, []);

  useEffect(()=>{
    if(question) {
      filterQuestionType("ANATOMY")
    }
  }, [question])

  const getQuestion = async (loop) => {
    try {
      let question = await FetchQuestions(loop);
      setQuestion(question.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filterQuestionType =(type)=>{
    let ret = question.filter((question)=>{
      return question.type === type
    })
    return ret;
  }

  const select = (question_id) =>{
    socket(user.user_id, question_id)
  }
  if(question)
  return <>
    <div className="grid grid-cols-5 mx-2 gap-4">
    {
      typeArray && typeArray.map((type,index)=>{
        return (
          <div className="flex gap-2 h-screen flex-col justify-evenly" key={index}>
          <Button className="h-1/6" color="accent" animation={false}><p className={type === "MICROBIOLOGY AND INFECTIOUS DISEASES" ? "text-2xl" : "text-2xl"}>{type}</p></Button>
          {
            filterQuestionType(type).map((data)=>{
              return <Button className="h-1/6" onClick={()=>{CURRENT_QUESTION_OWNER !== user.user_id ? alert("ผู้เข้าแข่งขันไม่มีสิทธิ์เลือกคำถามในข้อนี้") : select(data.id)}} color="warning" disabled = {data.isSelected} key={data.id}><p className="text-5xl">{data.score}</p></Button>
            })
          }
      </div>
        )
      })
    }
    </div>
  </>;
  return<>Loading...</>
}

QuestionSelector.propTypes = {
  CURRENT_QUESTION_OWNER: PropTypes.string,
  socket: PropTypes.any
}

export default QuestionSelector;
