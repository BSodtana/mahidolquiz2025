import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Divider, Modal } from "react-daisyui"
import * as BsIcon from "react-icons/bs"
import { FetchQuestionData } from "./helper";
import PropTypes from "prop-types"

function WaitingMC({ connection, CURRENT_QUESTION }) {
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const [question, setQuestion] = useState();
  useEffect(() => {
    if (!localStorage.getItem("user")) return navigate("/");
    if (localStorage.getItem("user"))
      return setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

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
        <div>
          <div className="text-center m-2">
            {/* <p className="text-xl">กรุณารอพิธีกร</p> */}
            <p className="text-md"></p>
            <Card className="shadow-xl">
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
          </div>


          <div className="pt-8 text-center">
            <Button color="info" size="lg" startIcon={<BsIcon.BsQuestion />} onClick={() => { setRulesModal(!rulesModal) }}>คำชี้แจงการใช้ระบบแข่งขัน</Button>
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
