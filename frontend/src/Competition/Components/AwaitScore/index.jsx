import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetMyAnswer, PostItemRealtime, GetItemRealtime, PostEarlySubmission, CheckProtect} from './helper';
import cheerGif from "./assets/cheer.gif";

function AwaitScore() {
  const [answer, setAnswer] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    getAnswer()
    SaveAndReset()
  }, []);

  const SaveAndReset = async () => {
    let data = await GetItemRealtime(JSON.parse(localStorage.getItem("user")).user_id);
    let AnswerData = await CheckProtect(JSON.parse(localStorage.getItem("user")).user_id);
    console.log(AnswerData)
    let protect = 0;
    if(data.now_item === "SHIELD"){
        protect = 1;
    }
    if(AnswerData.is_protect === 0){
      await PostEarlySubmission(JSON.parse(localStorage.getItem("user")).user_id, data.is_send, protect)
    }
    PostItemRealtime(JSON.parse(localStorage.getItem("user")).user_id, "NONE", 0)
  }

  const getAnswer = async () => {
    let data = await GetMyAnswer()
    console.log(data)
    setAnswer(data)
  }
  return (
    <div className="grid h-screen place-items-center">
        <div>
        {answer && <div className="text-center m-2">
          <p className="text-2xl">กรุณารอตรวจข้อสอบ</p>
          <div src={answer && answer.answer} className="w-auto h-auto text-xl"> คำตอบของคุณ : {answer.answer} </div>
          <p className="text-xs">คำตอบนี้บันทึกในระบบเมื่อ {answer && answer.createdDateTime}</p>
        </div>}

        {!answer && <div className="text-center m-2">
          <p className="text-xl">กรุณารอตรวจข้อสอบ</p>
          <p className="text-xs">ไม่มีคำตอบในระบบ กรุณาติดต่อแอดมิน</p>
        </div>}
        <div>
          <img src={cheerGif} alt="A cheering animation" />
        </div>
      </div>
    </div>
  )
}

export default AwaitScore;