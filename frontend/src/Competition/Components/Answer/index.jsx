import React, { useEffect, useState } from "react";
import { Alert, Button, Divider, Modal } from "react-daisyui";
import { GiPointySword } from "react-icons/gi"
import { FetchItems, FetchQuestionData, LogData, timeFormat, ItemBeingUsed, GetHint } from "./helper";
import * as BsIcon from "react-icons/bs"
import PropTypes from "prop-types"
import { ENDPOINT } from "../../../config"

function AnswerQuestion({ COUNTDOWN_UNTIL, CURRENT_QUESTION }) {
  const user = JSON.parse(localStorage.getItem("user"))
  const [question, setQuestion] = useState();
  // const [itemModal, setItemModal] = useState(false)
  const [item, setItem] = useState();
  const [hint, setHint] = useState();
  const [questionModal, setQuestionModal] = useState(false)
  const [timeoutModal, setTimeoutModal] = useState(false)
  const [textAnswer, setTextAnswer] = useState("")

  useEffect(() => {
    if (CURRENT_QUESTION) {
      setTimeoutModal(false)
      fetchQuestionData(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);

  useEffect(() => {
    if (COUNTDOWN_UNTIL <= 0) setTimeoutModal(true)
  }, [COUNTDOWN_UNTIL])

  const filterEffect = () => {
    if (item) {
      let result = item.filter((data) => { return data.item_used === 1 })
      if (result[0]?.executed_at === CURRENT_QUESTION) return result
    }
  }

  useEffect(() => {
    if (user.subrole === "final") fetchItem();
  }, [])

  const getHint = async () => {
    let result = await GetHint(CURRENT_QUESTION)
    console.log(result.data)
    setHint(result.data)
  }

  useEffect(() => {
    if (item) {
      if (filterEffect("hint")) {
        console.log(filterEffect("hint"))
        getHint()
      }
    }
  }, [item])

  const fetchQuestionData = async (q_id) => {
    let query = await FetchQuestionData(q_id);
    setQuestion(query);
  };

  const fetchItem = async () => {
    let query = await FetchItems(user.user_id)
    setItem(query)
  }

  const handleTextChange = (e) => {
    setTextAnswer(e.target.value);
  };

  useEffect(() => {
    if ((COUNTDOWN_UNTIL % 1 === 0) && (COUNTDOWN_UNTIL !== 0)) {
      LogData(user.user_id, CURRENT_QUESTION, textAnswer)
    }
  }, [COUNTDOWN_UNTIL, textAnswer, user.user_id, CURRENT_QUESTION])

  useEffect(() => {
    if (COUNTDOWN_UNTIL === 0) {
      LogData(user.user_id, CURRENT_QUESTION, textAnswer)
    }
  }, [COUNTDOWN_UNTIL, textAnswer, user.user_id, CURRENT_QUESTION])


  if (CURRENT_QUESTION)
    return (
      <>
        <div className="h-full w-full justify-center items-center">
          <div className="p-2">
            <Alert innerClassName="flex justify-between" className="bg-transparent shadow-lg">
              <div className="flex gap-5 items-center">
                <BsIcon.BsPerson /> {user.owner_name}
                <Button color="info" size="md" startIcon={<BsIcon.BsQuestion />} onClick={() => { setQuestionModal(!questionModal) }}>อ่านคำถาม</Button>
                {/* {user.subrole === "final" && <Button color="warning" size="md" startIcon={<GiPointySword />} onClick={() => { fetchItem(); setItemModal(true) }}>ไอเทม</Button>} */}
              </div>
              
              <div className="flex gap-2 items-right">
                <Button color="primary" size="md" onClick={() => { LogData(user.user_id, CURRENT_QUESTION, textAnswer)}}>Save</Button>
              </div>
              <p>{timeFormat(COUNTDOWN_UNTIL)}</p>
              <div className="flex gap-2 items-center">
                <Button color="error" size="md" onClick={() => { setTextAnswer("") }}><BsIcon.BsTrash /></Button>
              </div>
              
            </Alert>
          </div>
          <textarea
            style={{height: "85vh" , marginLeft: "10px", marginRight: "10px", width: "-webkit-fill-available"}}
            className="shadow-2xl textarea textarea-bordered bg-white bg-opacity-80"
            placeholder="คำตอบของคุณ"
            onChange={handleTextChange}
            value={textAnswer}
          />
        </div>
        {/* for final - physical item */}
        {/* {user.subrole === "final" && <> <Modal open={itemModal} onClickBackdrop={() => { setItemModal(!itemModal) }}>
          <Modal.Header>
            ไอเทมของทีม {user.owner_name}
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-4 gap-2">
              <Button color="tertiary" disabled={filterUsed("double")} size="lg" value="double" onClick={() => { itemExecute("double") }}><p className="text-2xl">Double</p></Button>
              <Button color="tertiary" disabled={filterUsed("extra_chance")} size="lg" value="extra_chance" onClick={() => { itemExecute("extra_chance") }}><p className="text-2xl">Extra Chance</p></Button>
              <Button color="tertiary" disabled={filterUsed("hint")} size="lg" value="hint" onClick={() => { itemExecute("hint") }}><p className="text-2xl">Hint</p></Button>
              <Button color="tertiary" disabled={filterUsed("streak")} size="lg" value="streak" onClick={() => { itemExecute("streak") }}><p className="text-2xl">Streak</p></Button>
            </div>
          </Modal.Body>
          <Divider>ไอเทมที่มีผลในข้อนี้</Divider>
          {
            item?.map((data) => {
              return <>{data.item_used && data.executed_at === CURRENT_QUESTION ? <>- {data.detail}<br /></> : null}</>
            })
          }
          {
            filterUsed("hint") ? <> {
              <>
                <Divider>คำใบ้</Divider>
                {hint?.hint_type === "photo" ? <><img src={hint?.hint_link}></img> <p>{hint?.hint_detail}</p></> : <>{hint?.hint_detail}</>}
              </>
            }</> : null
          }
        </Modal>
        </>} */}
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
  CURRENT_QUESTION: PropTypes.string
}

export default AnswerQuestion;
