import { PropTypes } from "prop-types";
import React, { useState, useEffect } from "react";
import { Badge, Card, Divider } from "react-daisyui";
import { FetchAnswer, FetchScore } from "./helper";
import * as BsIcon from "react-icons/bs"
import { ENDPOINT } from "../../config";
import { FetchQuestionData } from "./helper";

function ShowAnswer({ CURRENT_QUESTION, QUESTION_OWNER, CURRENT_STATUS}) {
  const [answer, setAnswer] = useState(false);
  const [score, setScore] = useState()

  useEffect(() => {
    if (CURRENT_QUESTION) {
      fetchAnswer(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);

  useEffect(() => {
    if (CURRENT_STATUS === "SHOW_SUMMARY") {
      fetchScore(CURRENT_QUESTION)
    }
  }, [CURRENT_STATUS])

  const fetchAnswer = async (q_id) => {
    let data = await FetchAnswer(q_id);
    setAnswer(data);
  };

  const fetchScore = async (q_id) => {
    let score = await FetchScore(q_id)
    console.log(score)
    setScore(score)
  }

  const filterScore = (user_id) => {
    if (score?.score) {
      let score_data = score?.score.filter((data) => {
        return data.user_id === user_id
      })
      return score_data[0]?.score
    }
  }
  const [question, setQuestion] = useState()

  useEffect(() => {
      if (CURRENT_QUESTION) {
          fetchQuestion(CURRENT_QUESTION)
      }
  }, [CURRENT_QUESTION])


  const fetchQuestion = async (question) => {
      try {
          let q = await FetchQuestionData(question);
          setQuestion(q);
      } catch (error) {
          console.error("Error fetching question data:", error);
      }
  };
  console.log(question)

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="grid rounded-lg bg-transparent text-gray-700 shadow-2xl text-center text-3xl w-11/12 animate__animated animate__fadeInUp p-5 glass">
        
        {CURRENT_STATUS === "SHOW_SUMMARY" ? 
        <><p className="animate__animated animate__fadeInUp">คำตอบที่ถูกต้อง<br />
              { question && question.underline !== null? (<>
                <u>{question.underline}</u>
              </>)
              : 
              (<>
              <strong>
                {question && question.correct_answer}
                </strong>
                </>)}
        </p>


         {/* {
            (score?.question_data[0].correct_answer_description) && (
              <p className="text-xl animate__animated animate__fadeInUp">
                <Divider className="animate__animated animate__fadeInUp"><strong>คำอธิบาย</strong></Divider>
                {score && score?.question_data[0].correct_answer_description?.split("<br/>").map((i) => {
                  return (<><span>{i}</span> <br /></>)
                })}
              </p>
            )
          } */}

          <div className="animate__animated animate__fadeInUp flex justify-center">
            {score?.question_data[0].correct_answer_photo && <img className="h-80" src={`${ENDPOINT}/static/${score?.question_data[0].correct_answer_photo}`} />}
          </div>
        </> : "คำตอบของผู้เข้าแข่งขัน"}
      </div>
      <div className=" ml-10 mr-10 grid grid-cols-5 gap-5">
        {answer &&
          answer.map((data, index) => {
            return (
              <Card key={index} className="col-span-1 bg-white bg-opacity-80 p-2 rounded-2xl shadow-xl animate__animated animate__fadeInDown" style={{ animationDelay: `${750 + index * 175}ms`, height: "350px" }}>
                <Card.Body>
                  <Card.Title className="flex justify-around"><p className="text-2xl text-center text-gray-700">{data.owner_name}</p>
                    {CURRENT_STATUS === "SHOW_SUMMARY" ? filterScore(data.user_id) > 0 ? <BsIcon.BsCheckLg className="animate__animated animate__fadeInUp text-success text-5xl" /> : <BsIcon.BsXLg className="animate__animated animate__fadeInUp text-error text-5xl" /> : null}
                    {QUESTION_OWNER === data.user_id ? <Badge color="warning">เจ้าของคำถาม</Badge> : null}
                  </Card.Title>
                  <div className="text-xl text-center text-gray-700 h-48 overflow-y-auto">{data.answer}</div>
                  <Card.Actions>
                    {CURRENT_STATUS === "SHOW_SUMMARY" ? <p className={filterScore(data.user_id) > 0 ? "text-center text-4xl text-success animate__animated animate__fadeInUp" : "text-center text-4xl text-error animate__animated animate__fadeInUp"}>{filterScore(data.user_id)}</p> : null}
                  </Card.Actions>
                </Card.Body>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

ShowAnswer.propTypes = {
  CURRENT_QUESTION: PropTypes.string.isRequired,
  QUESTION_OWNER: PropTypes.string.isRequired,
  CURRENT_STATUS: PropTypes.string.isRequired
}

export default ShowAnswer;
