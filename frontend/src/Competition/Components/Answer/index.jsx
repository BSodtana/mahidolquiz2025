import React, { useEffect, useState } from "react";
import { Alert, Button, Divider, Modal } from "react-daisyui";
import { GiPointySword } from "react-icons/gi"
import { FetchItems, FetchQuestionData, LogData, timeFormat, ItemBeingUsed, GetHint } from "./helper";
import * as BsIcon from "react-icons/bs"
import PropTypes from "prop-types"
import { ENDPOINT } from "../../../config"
import { socket } from "../../../services/socket";

function AnswerQuestion({ COUNTDOWN_UNTIL, CURRENT_QUESTION, teamsData, myTeamId }) {
  const user = JSON.parse(localStorage.getItem("user"))
  const [question, setQuestion] = useState();
  const [item, setItem] = useState();
  const [hint, setHint] = useState();
  const [questionModal, setQuestionModal] = useState(false)
  const [timeoutModal, setTimeoutModal] = useState(false)
  const [textAnswer, setTextAnswer] = useState("")

  const myTeam = teamsData[myTeamId] || {};

  useEffect(() => {
    if (CURRENT_QUESTION) {
      setTimeoutModal(false)
      fetchQuestionData(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);

  useEffect(() => {
    if (COUNTDOWN_UNTIL <= 0) setTimeoutModal(true)
  }, [COUNTDOWN_UNTIL])

  const fetchQuestionData = async (q_id) => {
    let query = await FetchQuestionData(q_id);
    setQuestion(query);
  };

  const handleTextChange = (e) => {
    setTextAnswer(e.target.value);
  };

  useEffect(() => {
    if ((COUNTDOWN_UNTIL % 1 === 0) && (COUNTDOWN_UNTIL !== 0)) {
      LogData(user.user_id, CURRENT_QUESTION, textAnswer)
    }
  }, [COUNTDOWN_UNTIL, textAnswer, user.user_id, CURRENT_QUESTION])

  const handleSubmitAnswer = () => {
    socket.emit("SUBMIT_ANSWER", {
      userId: myTeamId,
      questionId: CURRENT_QUESTION,
      answer: textAnswer,
    });
    alert("Answer Submitted!");
  };

  const handleUseItem = async (itemName) => {
    let body = { userId: myTeamId };
    if (itemName === 'burn') {
      const targetId = prompt("Enter the ID of the team you want to burn:");
      if (!targetId) return;
      body.targetId = targetId;
    }

    try {
      const response = await fetch(`${ENDPOINT}/item/${itemName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!result.success) {
        alert(`Error: ${result.message}`);
      } else {
        alert(`Item ${itemName} used successfully!`);
      }
    } catch (error) {
      alert("Failed to use item. See console for details.");
      console.error(`Failed to use item ${itemName}:`, error);
    }
  };


  if (CURRENT_QUESTION)
    return (
      <>
        <div className="h-full w-full justify-center items-center bg-white-blur">
          <div className="p-2">
            <Alert innerClassName="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <BsIcon.BsPerson /> {user.owner_name}
                <Button color="info" size="md" startIcon={<BsIcon.BsQuestion />} onClick={() => { setQuestionModal(!questionModal) }}>อ่านคำถาม</Button>
                <span className="font-bold text-lg">🌸 {myTeam.flower_parts || 5} / 7</span>
              </div>
              
              <div className="flex gap-2 items-center">
                 {/* Item Buttons */}
                 <Button color="success" size="sm" onClick={() => handleUseItem('add')} disabled={myTeam.item_add_used || myTeam.flower_parts >= 7}>Add</Button>
                 <Button color="warning" size="sm" onClick={() => handleUseItem('burn')} disabled={myTeam.item_burn_used}>Burn</Button>
                 <Button color="info" size="sm" onClick={() => handleUseItem('revive')} disabled={myTeam.item_revive_used || myTeam.flower_parts >= 5}>Revive</Button>
              </div>

              <div className="flex gap-2 items-center">
                <Button className="text-black" style={{backgroundColor:"#86DC3D", borderWidth: '0'}} size="md" onClick={() => { LogData(user.user_id, CURRENT_QUESTION, textAnswer)}}>Save</Button>
                <Button color="primary" size="md" onClick={handleSubmitAnswer}>Submit</Button>
                <p className="font-mono text-2xl">{timeFormat(COUNTDOWN_UNTIL)}</p>
                <Button color="error" size="md" onClick={() => { setTextAnswer("") }}><BsIcon.BsTrash /></Button>
              </div>
              
            </Alert>
          </div>
          <textarea
            style={{height: "85vh" , marginLeft: "10px", marginRight: "10px", width: "-webkit-fill-available"}}
            className="shadow-2xl textarea textarea-bordered"
            placeholder="คำตอบของคุณ"
            onChange={handleTextChange}
            value={textAnswer}
          />
        </div>
        <Modal open={questionModal} onClickBackdrop={() => { setQuestionModal(!questionModal) }}>
          <Button size="sm" color="ghost" shape="circle" className="absolute right-5 top-5" onClick={() => { setQuestionModal(!questionModal) }}>
            x
          </Button>
          <Modal.Header>
            คำถาม {(question?.type) && question?.type}{(question?.score) && ` : ${question?.score} คะแนน`}{(question?.level) && ` : ระดับ ${question?.level}`}
          </Modal.Header>
          <Modal.Body>

          {question && question.type === "FINAL"? (<>
                        <p className="text-2xl">
                            {question.majorq}
                        <div className="flex justify-center pt-6">
                            {question.majorpics && <img src={`${ENDPOINT}/static/${question.majorpics}`} className='min-h-[350px] max-h-[350px] p-2'></img>}
                        </div>
                        {question.text}
                        </p>
                    <div className="flex justify-center pt-6">
                        {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='min-h-[350px] max-h-[350px] p-2'></img>}
                    </div>
                    </>): ( question &&
                        <>
                        <p className="text-2xl">
                            {question.text}
                            <div className="flex justify-center pt-6">
                                {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='min-h-[350px] max-h-[350px] p-2'></img>}
                            </div>
                        </p>
                    </>
                )}

          </Modal.Body>
        </Modal>
        <Modal open={timeoutModal}>
          <Modal.Body>
            <p className="text-error text-4xl">หมดเวลา</p>
            <p>ระบบกำลังบันทึกคำตอบล่าสุด</p>
          </Modal.Body>
        </Modal>
      </>
    );
}

AnswerQuestion.propTypes = {
  COUNTDOWN_UNTIL: PropTypes.number,
  CURRENT_QUESTION: PropTypes.string,
  teamsData: PropTypes.object,
  myTeamId: PropTypes.string
}

export default AnswerQuestion;
