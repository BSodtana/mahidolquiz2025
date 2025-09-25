import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Divider, Modal, Navbar } from "react-daisyui"
import * as BsIcon from "react-icons/bs"
import { FetchQuestionData , updateItemFlower, GetItemRealtime, getItemData } from "./helper";
import addIcon from "../../../assets/add_icon.png";
import reviveIcon from "../../../assets/revive_icon.png";
import shieldIcon from "../../../assets/shield_icon.png";
import PropTypes from "prop-types"
import toast, { Toaster } from "react-hot-toast"

// Flower
import item3 from '../Answer/items/item3.png';
import item4 from '../Answer/items/item4.png';
import item5 from '../Answer/items/item5.png';
import item6 from '../Answer/items/item6.png';
import item7 from '../Answer/items/item7.png';

const itemImages = {
  3: item3,
  4: item4,
  5: item5,
  6: item6,
  7: item7
};


function WaitingMC({ connection, CURRENT_QUESTION }) {
  const [user, setUser] = useState();
  const users = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate();
  const [question, setQuestion] = useState();
  const [isUsed, setIsUsed] = useState(false);
  const [flowerNumber, setFlowerNumber] = useState(0);
  const [addNumber, setAddNumber] = useState(0);
  const [reviveNumber, setReviveNumber] = useState(0);
  const [shieldNumber, setShieldNumber] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    if (!localStorage.getItem("user")) return navigate("/");
    if (localStorage.getItem("user"))
      return setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  const runOnceAndStore = async () => {
    let item = await GetItemRealtime(users.user_id);
    setFlowerNumber(item.current_units);

    let add = await getItemData(users.user_id, "ADD");
    setAddNumber(add.is_used);
    
    let revive = await getItemData(users.user_id, "REVIVE");
    setReviveNumber(revive.is_used);

    let shield = await getItemData(users.user_id, "SHIELD");
    setShieldNumber(shield.is_used);
  };

  useEffect(() => {
    runOnceAndStore();
    if (flowerNumber > 0) {
      setSelectedImage(itemImages[flowerNumber]);
    }
  }, [flowerNumber]);

  useEffect(() => {
    if (CURRENT_QUESTION) {
      FetchData(CURRENT_QUESTION)
    }
  }, [CURRENT_QUESTION])

  const FetchData = async (q_id) => {
    let query = await FetchQuestionData(q_id)
    console.log(query)
    setQuestion(query)
  }
  
  // modal Rules
  const [rulesModal, setRulesModal] = useState(false)

  if (CURRENT_QUESTION && question)
    return (
      <div className="grid h-screen place-items-center">
        <div className="grid grid-cols-2 gap-4 w-11/12">
          <div className="text-center m-2">
            <Toaster position="top-center" reverseOrder={false} />
            <p className="text-xl">กรุณารอพิธีกร</p>
            <p className="text-md"></p>
            <div className="flex justify-center gap-6 pt-4">
              <button
                type="button"
                onClick={() => { updateItemFlower(user.user_id, "ADD", CURRENT_QUESTION, setIsUsed) }}
                disabled={isUsed}
                aria-label={"Use Heal (" + addNumber + ")"}
                className="flex flex-col items-center gap-2 rounded-full border-none bg-transparent p-0 text-slate-700 transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <img src={addIcon} alt="" className="h-24 w-24 select-none object-contain" draggable="false" />
                <span className="text-lg font-semibold">({addNumber})</span>
              </button>
              <button
                type="button"
                onClick={() => { updateItemFlower(user.user_id, "REVIVE", CURRENT_QUESTION, setIsUsed) }}
                disabled={isUsed}
                aria-label={"Use Revive (" + reviveNumber + ")"}
                className="flex flex-col items-center gap-2 rounded-full border-none bg-transparent p-0 text-slate-700 transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <img src={reviveIcon} alt="" className="h-24 w-24 select-none object-contain" draggable="false" />
                <span className="text-lg font-semibold">({reviveNumber})</span>
              </button>
              <button
                type="button"
                onClick={() => { updateItemFlower(user.user_id, "SHIELD", CURRENT_QUESTION, setIsUsed) }}
                disabled={isUsed}
                aria-label={"Use Shield (" + shieldNumber + ")"}
                className="flex flex-col items-center gap-2 rounded-full border-none bg-transparent p-0 text-slate-700 transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <img src={shieldIcon} alt="" className="h-24 w-24 select-none object-contain" draggable="false" />
                <span className="text-lg font-semibold">({shieldNumber})</span>
              </button>
            </div>
            <Card className="shadow-xl mt-6">
              <Card.Body>
                <p className="text-3xl">{question.type} {question.level && "ระดับ"} {question.level}</p>
                <p className="text-3xl">{question.score} คะแนน</p>
                <p className="text-3xl">{question.time} วินาที</p>
                <Divider>ข้อมูลผู้เล่น</Divider>
                <p>ทีม {user && user.owner_name}</p>
                <p
                  className={
                    connection === true
                      ? "flex items-center justify-center text-success"
                      : "flex items-center justify-center text-error"
                  }
                >
                  {connection === true ? (
                    <>
                      <BsIcon.BsCheck2Circle />
                      เชื่อมต่อกับระบบเกมสำเร็จ
                    </>
                  ) : (
                    <>
                      <BsIcon.BsExclamation />
                      ไม่สามารถติดต่อกับระบบได้ โปรดติดต่อเจ้าหน้าที่
                    </>
                  )}
                </p>
              </Card.Body>
            </Card>
            <div className="pt-8 text-center">
              <Button color="info" size="lg" startIcon={<BsIcon.BsQuestion />} onClick={() => { setRulesModal(!rulesModal) }}>คำชี้แจงการใช้ระบบแข่งขัน</Button>
            </div>
          </div>
          <div className="text-center m-2" 
    style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '400px' // Example height to demonstrate vertical centering
    }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={`Item ${flowerNumber}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '20px auto',
                width: '550px'}}
              />
            )}<p className="text-2xl">Multiplier x {flowerNumber/5} 🔥</p>
          </div>

          <Modal open={rulesModal} onClickBackdrop={() => { setRulesModal(!rulesModal) }}>
            <Button size="sm" color="ghost" shape="circle" className="absolute right-4 top-4" onClick={() => { setRulesModal(!rulesModal) }}>
              x
            </Button>
            <Modal.Header>
              <p className="text-xl">คำชี้แจงการใช้ระบบแข่งขัน</p>
            </Modal.Header>
            <Modal.Body>
            <ul>
                <li>1. เขียนคำตอบอัตนัยแบบสั้น หรือ short answer ลงในแท็ปเล็ตภายในระยะเวลาที่กำหนด ซึ่งจะต้องเขียนหลังจากพิธีกรพูดจบและหากหมดเวลาระบบจะส่งคำตอบอัตโนมัติ 
                </li>
                <br />
                <li>2. หากต้องการลบคำตอบให้กดปุ่มถังขยะมุมขวาบนระบบจะทำการลบคำตอบทั้งหมด หากไม่ต้องการลบทั้งหมดสามารถใช้ปากกาขีดเส้นแนวนอน 1 เส้นได้ เส้นทั้งหมดรวมถึงรอยทดที่ไม่มีการขีดฆ่าจะถูกนำมา พิจารณาคะแนนตามดุลพินิจของกรรมการ</li>
                <br />
                <li>3. ในคำถามที่มี (…) ด้านหลังให้ตอบในรูปแบบตาม (…) ที่กำหนด / (TT) Technical Term ตอบเป็นคำศัพท์เฉพาะทางการแพทย์ภาษาอังกฤษแบบหรือสามารถย่อตามหลักสากลได้/ (Full name) ตอบเป็นชื่อเต็มภาษาอังกฤษเท่านั้น
                </li>
                <br />
                <li>4.ในรอบรองชนะเลิศทุกทีมจะได้รับไอเท็มตัวช่วย x2 และ x3 แต่ละทีมสามารถใช้ไอเทมได้อย่างละ 1 ครั้ง <strong>โดยแจ้งให้ผู้คุมแข่งขันก่อนที่จะปล่อยคำถาม</strong>
                <br/>
                </li>
                <li>5. <strong>การชาเล้นจ์คำตอบหรือการอุทธรณ์ข้อสอบ</strong> สามารถทำได้หลังจากที่คณะกรรมการเฉลยคำตอบเสร็จสิ้น
                </li>
                <br />
                <li>6. เมื่อครบ 18 ข้อแล้ว กรณีทีมอันดับที่ 3 มีคะแนนรวมเท่ากัน จะมีคำถามสำรองจากนิทรรศการ 2 ข้อ<strong>หากยังไม่สามารถตัดสินได้จะพิจารณาคะแนนรวมของรอบคัดเลือกเป็นลำดับต่อไป</strong>
                </li>
                <br />
                <li>7. หากเกิดปัญหาขึ้นเกี่ยวกับการทำข้อสอบ การส่งคำตอบ การแสดงคะแนนไม่ถูกต้อง<strong>ให้แจ้งผู้คุมแข่งขันประจำทีมของตนเองและรอการตอบกลับ (ผู้คุมแข่งขันจะไม่ตอบปัญหาที่เกี่ยวข้องกับคำถามและคำตอบ)</strong>
                </li>
                <br />
              </ul>
            </Modal.Body>
          </Modal>

        </div>
      </div>
    );
}

WaitingMC.propTypes = {
  connection: PropTypes.bool.isRequired,
  CURRENT_QUESTION: PropTypes.string.isRequired
}

export default WaitingMC;
