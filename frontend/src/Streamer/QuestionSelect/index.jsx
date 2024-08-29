import React, { useState, useEffect } from "react";
import { FetchQuestions, GetUserDetail } from "./helper";
import { Alert, Button } from "react-daisyui";
import StreamerSocket from "../socket";

function QuestionSelect({QUESTION_OWNER}) {
  const [question, setQuestion] = useState();
  const [typeArray, setTypeArray] = useState([
    "ANATOMY",
    "PHYSIOLOGY",
    "GENERAL KNOWLEDGE",
    "BIOCHEMISTRY",
    "MICROBIOLOGY AND INFECTIOUS DISEASES",
  ]);
  const [owner, setOwner] = useState(false)

  useEffect(() => {
    getQuestion();
  }, []);

  useEffect(()=>{
    getUserDetail(QUESTION_OWNER)
  }, [QUESTION_OWNER])

  const filterQuestionType = (type) => {
    let ret = question.filter((question) => {
      return question.type === type;
    });
    return ret;
  };

  const getUserDetail = async (id) =>{
    let data = await GetUserDetail(id)
    setOwner(data[0])
  }

  const getQuestion = async (loop) => {
    try {
      let question = await FetchQuestions(loop);
      setQuestion(question.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen bg-white-blur">
    <div className="px-2 py-5 animate__animated animate__fadeInUp">
        <div className="bg-white bg-opacity-60 shadow-xl w-full rounded-xl"><p className="text-center text-3xl p-4">ขณะนี้ทีม <strong>{owner?.owner_name}</strong> กำลังเลือกคำถาม</p></div>
    </div>
      <div className="grid grid-cols-5 px-2 gap-4 h-5/6 animate__animated animate__fadeIn" style={{animationDelay: "750ms"}}>
        {question &&
          typeArray &&
          typeArray.map((type, index) => {
            return (
              <div className="flex gap-2 flex-col justify-evenly" key={index}>
                <Button
                  className="h-1/6 shadow-xl"
                  color="accent"
                  animation={false}
                >
                  <p
                    className={
                      type === "MICROBIOLOGY AND INFECTIOUS DISEASES"
                        ? "text-3xl"
                        : "text-4xl"
                    }
                  >
                    {type}
                  </p>
                </Button>
                {filterQuestionType(type).map((data) => {
                  return (
                    <Button
                      className="h-1/6 shadow-xl"
                      color="warning"
                      disabled={data.isSelected}
                      key={data.id}
                    >
                      <p className="text-5xl">{data.score}</p>
                    </Button>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default QuestionSelect;
