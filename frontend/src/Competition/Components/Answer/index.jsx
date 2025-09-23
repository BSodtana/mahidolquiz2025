import React, { useEffect, useState } from "react";
import { Alert, Button, Divider, Modal } from "react-daisyui";
import { GiPointySword } from "react-icons/gi"
import { FetchItems, FetchQuestionData, LogData, timeFormat, GetQuestionInfo, handleSubmission, checkRejectText, PostItemRealtime, GetItemRealtime, SaveData } from "./helper";
import * as BsIcon from "react-icons/bs"
import PropTypes from "prop-types"
import { ENDPOINT } from "../../../config"
import { Toaster } from "react-hot-toast"

// Flower
import item3 from './items/item3.png';
import item4 from './items/item4.png';
import item5 from './items/item5.png';
import item6 from './items/item6.png';
import item7 from './items/item7.png';

const itemImages = {
  3: item3,
  4: item4,
  5: item5,
  6: item6,
  7: item7
};

let time_limit, item_sql,selectedImage, flowerNumber = 0;
function AnswerQuestion({ COUNTDOWN_UNTIL, CURRENT_QUESTION }) {
  const user = JSON.parse(localStorage.getItem("user"))
  const [question, setQuestion] = useState();
  // const [itemModal, setItemModal] = useState(false)
  const [item, setItem] = useState();
  // const [hint, setHint] = useState();
  const [isSaved, setIsSaved] = useState(false);
  const [TimeButton, setTimeButton] = useState(false)
  const [questionModal, setQuestionModal] = useState(false)
  const [timeoutModal, setTimeoutModal] = useState(false)
  const [textAnswer, setTextAnswer] = useState("")

  const runOnceAndStore = async () => {
    let time = await GetQuestionInfo(CURRENT_QUESTION);
    let item = await GetItemRealtime(user.user_id);
    time_limit = time;
    item_sql = item.now_item;
    flowerNumber = item.current_units;
    if(item_sql == "ADD"){
      item_sql = "Use ADD";
    }else if(item_sql == "REVIVE"){
      item_sql = "Use REVIVE";
    }else if(item_sql == "SHIELD"){
      item_sql = "Use SHIELD";
    }else{
      item_sql = "No Item Use";
    }
    console.log("Time limit for question", CURRENT_QUESTION, "is", time_limit);
  };

  useEffect(() => {
    runOnceAndStore();
    if (CURRENT_QUESTION) {
      setTimeoutModal(false)
      fetchQuestionData(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);
  

  useEffect(() => {
    if (COUNTDOWN_UNTIL <= 0) setTimeoutModal(true)
    else setTimeoutModal(false)
  }, [COUNTDOWN_UNTIL])

  useEffect(() => {
    if (COUNTDOWN_UNTIL <= 0){
        if(textAnswer.trim() != "") {
          LogData(user.user_id, CURRENT_QUESTION, textAnswer)
          SaveData(user.user_id, CURRENT_QUESTION, textAnswer)
        }
        setIsSaved(false)
        setTimeButton(false)
    }
    console.log(time_limit, COUNTDOWN_UNTIL);
    if( (time_limit / 2) > COUNTDOWN_UNTIL && COUNTDOWN_UNTIL > 0){
        setTimeButton(true)
    }
  }, [COUNTDOWN_UNTIL,CURRENT_QUESTION])

  selectedImage = null;
  
  // Use a try/catch block to handle cases where the file doesn't exist
  try {
    selectedImage = itemImages[flowerNumber];
  } catch (error) {
    console.error(`Image for item ${flowerNumber} not found.`);
    //console.log(flowerNumber)
  }

  const filterEffect = () => {
    if (item) {
      let result = item.filter((data) => { return data.item_used === 1 })
      if (result[0]?.executed_at === CURRENT_QUESTION) return result
    }
  }
  // On fix
  //
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
    if ((COUNTDOWN_UNTIL % 5 === 0) && (COUNTDOWN_UNTIL !== 0) && textAnswer.trim() !== ""){
      LogData(user.user_id, CURRENT_QUESTION, textAnswer)
    }
  }, [COUNTDOWN_UNTIL, textAnswer, user.user_id, CURRENT_QUESTION])
  
  if (CURRENT_QUESTION)
    return (
      <>
        <div className="h-full w-full justify-center items-center">
          <div className="p-2">
            <Toaster position="top-center" reverseOrder={false} />
            <Alert innerClassName="flex justify-between" className="bg-transparent shadow-lg">
              <div className="flex gap-5 items-center">
              {selectedImage && <img class="mask mask-square" src={selectedImage} alt={`Item ${flowerNumber}`} style={{ width: '70px', height: '40px', transform: 'scale(2.3)'}} />}
                x {flowerNumber/5} 🔥
              </div>
              <div className="flex gap-5 items-center">
                <BsIcon.BsPerson /> {user.owner_name}
                <Button color="info" size="md" startIcon={<BsIcon.BsQuestion />} onClick={() => { setQuestionModal(!questionModal) }}>อ่านคำถาม</Button>
                {/* {user.subrole === "final" && <Button color="warning" size="md" startIcon={<GiPointySword />} onClick={() => { fetchItem(); setItemModal(true) }}>ไอเทม</Button>} */}
              </div>
              <div className="flex gap-2 items-center">
                <Button color="success" size="md">
                  { item_sql }
                </Button>
              </div>
              <div className="flex gap-2 items-right">
              <Button
              color="primary"
              size="md"
              onClick={() => {
                handleSubmission(user.user_id, CURRENT_QUESTION, textAnswer, setIsSaved, COUNTDOWN_UNTIL);
              }}
              disabled={isSaved || TimeButton || timeoutModal}>
              {isSaved ? "หมดเวลาส่งก่อนเวลา" : `ส่งคำตอบก่อนเวลา ${(COUNTDOWN_UNTIL - time_limit / 2) > 0 ? ` (${timeFormat(COUNTDOWN_UNTIL - time_limit / 2)})` : ''}`}
              </Button>              
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
            onFocus={() => { checkRejectText(user.user_id, CURRENT_QUESTION, setIsSaved) }}
            value={textAnswer}
            disabled={isSaved || timeoutModal}
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
        <Modal open={questionModal} onClickBackdrop={() => { setQuestionModal(!questionModal) }} className="w-screen h-screen max-w-none rounded-none top-0 left-0 m-0">
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
