import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetMyAnswer } from './helper';

function AwaitScore() {
  const [answer, setAnswer] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    getAnswer()
  }, []);

  const getAnswer = async () => {
    let data = await GetMyAnswer()
    console.log(data)
    setAnswer(data)
  }
  return (
    <div className="grid h-screen place-items-center">
      <div>
        {answer && <div className="text-center m-2">
          <p className="text-xl">กรุณารอตรวจข้อสอบ</p>
          <p className="text-xs">คำตอบนี้บันทึกในระบบเมื่อ {answer && answer.createdDateTime}</p>
          <img src={answer && answer.answer} className="w-auto h-auto"></img>
        </div>}

        {!answer && <div className="text-center m-2">
          <p className="text-xl">กรุณารอตรวจข้อสอบ</p>
          <p className="text-xs">ไม่มีคำตอบในระบบ กรุณาติดต่อแอดมิน</p>
        </div>}

      </div>
    </div>
  )
}

export default AwaitScore;