import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Divider, Modal } from 'react-daisyui';
import { SocketConnection } from '../Helpers/AdminMainPage';
import { FetchAllQuestion, ResetFlower, ResetItem, ResetStatusQuestion } from './helper';
import { Toaster } from "react-hot-toast"
import cheerGif from "./assets/cheer.gif";

function AdminMainPage() {
    const [, gameStatus, questionOwner, loop, emitValue, emitQuestionValue, resetGameState, fetchGameState, emitLoop, emitStart, emitQuestion, currentQuestionSelect] = SocketConnection()
    const [currentButton, setCurrentButton] = useState()
    const [currentLoop, setCurrentLoop] = useState()
    const [allQuestion, setAllQuestion] = useState()
    const [open, setOpen] = useState(false)
    const loop_A = ["semi01", "semi02", "semi03", "semi04", "semi05", "semi06", "semi07", "semi08"]
    const loop_B = ["semi09", "semi10", "semi11", "semi12", "semi13", "semi14", "semi15", "semi16"]
    const loop_C = ["semi17", "semi18", "semi19", "semi20", "semi21", "semi22", "semi23", "semi24"]

    useEffect(() => {
        FetchAllQuestion().then((data) => { setAllQuestion(data) })
    }, [])

    return (
        <div>
            <p className="text-2xl text-center">MAHIDOL QUIZ GAMEMASTER DESK</p>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="grid grid-cols-4">
                <div className="col-span-1">
                    <Card>
                        <Card.Body>
                            <Alert innerClassName="text-xs">สถานะปัจจุบัน: {gameStatus}</Alert>
                            <Card.Title>เลือกสถานะเกม</Card.Title>
                            <Button color="primary" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "WELCOME" }) }}>ปิดแผ่นป้าย (Default)</Button>
                            {/*<Button color="primary" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "SELECT_QUESTION" }) }}>เลือกแผ่นป้าย</Button> */}
                            <Button color="primary" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "AWAIT_MC" }) }}>รอปล่อยคำถาม</Button>
                            <Button color="error" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "START_QUESTION" }); emitStart(); }}>ปล่อยคำถาม</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "AWAIT_SCORE" }) }}>รอคะแนน</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "SHOW_SUMMARY" }) }}>ผลการเล่น</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "REVEAL_SCORE" }) }}>Scoreboard</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={()=> { emitValue({ role: "admin", CURRENT_GAME_STATUS: "DISPLAY_RULE"})}}>กติกาการแข่ง</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { fetchGameState() }}>เรียกสถานะจากฐานข้อมูล</Button>

                            <Divider>คำสั่งพิเศษ</Divider>
                            <Alert innerClassName="text-xs"><p>คำถามข้อปัจจุบัน : {currentQuestionSelect ? currentQuestionSelect : "NONE"}</p></Alert>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { resetGameState() }}>รีเซ็ตสถานะเกม</Button>
                            <Button color="warning" size="sm" variant="outline" onClick={() => { setOpen(true) }}>ยิงคำถาม</Button>
                            <Button color="error" size="sm" variant="outline" onClick={() => { emitValue({ role: "admin", CURRENT_GAME_STATUS: "REVIEW_QUESTION" }); }}>โชว์คำถามเต็ม (ไม่จับเวลา)</Button>
                        </Card.Body>
                    </Card>
                </div>
                {/*
                <div className="col-span-1">
                    <Card>
                        <Card.Body>
                            <Alert innerClassName="text-xs">เจ้าของปัจจุบัน: {questionOwner}</Alert>
                            <Card.Title>เลือกทีมเจ้าของคำถาม</Card.Title>
                            {currentLoop === "A" ? loop_A.map((data, index) => {
                                return <Button key={index} color="warning" name={data} size="sm" variant={currentButton === data ? "" : "outline"} onClick={(e) => { setCurrentButton(e.target.name); emitQuestionValue({ role: "admin", CURRENT_QUESTION_OWNER: data }) }}>{data}</Button>
                            }) : currentLoop === "B" ? loop_B.map((data, index) => {
                                return <Button key={index} color="warning" name={data} size="sm" variant={currentButton === data ? "" : "outline"} onClick={(e) => { setCurrentButton(e.target.name); emitQuestionValue({ role: "admin", CURRENT_QUESTION_OWNER: data }) }}>{data}</Button>
                            }) : currentLoop === "C" ? loop_C.map((data, index) => {
                                return <Button key={index} color="warning" name={data} size="sm" variant={currentButton === data ? "" : "outline"} onClick={(e) => { setCurrentButton(e.target.name); emitQuestionValue({ role: "admin", CURRENT_QUESTION_OWNER: data }) }}>{data}</Button>
                            }) : null}
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-span-1">
                    <Card>
                        <Card.Body>
                            <Alert innerClassName="text-xs">Loop ปัจจุบัน: {loop}</Alert>
                            <Card.Title>เลือกลูป</Card.Title>
                            <Button color="warning" name="A" size="sm" variant={currentLoop === "A" ? "" : "outline"} onClick={(e) => { setCurrentLoop(e.target.name); emitLoop({ role: "admin", SELECT_LOOP: "A" }) }}>A</Button>
                            <Button color="warning" name="B" size="sm" variant={currentLoop === "B" ? "" : "outline"} onClick={(e) => { setCurrentLoop(e.target.name); emitLoop({ role: "admin", SELECT_LOOP: "B" }) }}>B</Button>
                            <Button color="warning" name="C" size="sm" variant={currentLoop === "C" ? "" : "outline"} onClick={(e) => { setCurrentLoop(e.target.name); emitLoop({ role: "admin", SELECT_LOOP: "C" }) }}>C</Button>
                        </Card.Body>
                    </Card>
                </div>
                {*/}
                <div className="col-span-1">
                    <Card>
                        <Card.Body>
                            <Alert innerClassName="text-xs">คำสั่งสร้างพิเศษ</Alert>
                            <Card.Title>คำสั่ง</Card.Title>
                            <Button color="error" size="sm" variant="outline" onClick={() => { ResetFlower() }}>Reset Flower</Button>
                            <Button color="error" size="sm" variant="outline" onClick={() => { ResetStatusQuestion() }}>Reset Status</Button>
                            <Button color="error" size="sm" variant="outline" onClick={() => { ResetItem() }}>Reset Heal</Button>
                            <img src={cheerGif} alt="A cheering animation" />
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-span-2">
                    <Card>
                        <Card.Body>
                            <Alert innerClassName="text-xs">แนะนำปุ่มกด</Alert>
                            <Card.Title>คู่มือการใช้งาน</Card.Title>
                            <p className="text-s">1. ปิดแผ่นป้าย : เมื่อต้องการเข้าสู่หน้าหลักปกติ ไม่เข้าเกม</p>
                            <p className="text-s">2. รอปล่อยคำถาม : เลือกคำถามแล้วรอเข้าข้อคำถาม (ใช้ไอเทม)</p>
                            <p className="text-s">3. ปล่อยคำถาม : เริ่มคำถามในข้อนั้นๆ</p>
                            <p className="text-s">( Warning : ควรปล่อยเวลาหมดก่อนกดปุ่มอื่น )</p>
                            <p className="text-s">4. รอคะแนน : เพื่อให้กรรมการให้คะแนนในข้อนั้นๆ</p>
                            <p className="text-s">( Reminder : เกมจะโยนเข้ารอคะแนนอัตโนมัติหลังเวลาหมด )</p>
                            <p className="text-s">5. ผลการเล่น : แสดงคะแนนในข้อนั้นๆ หลังจากกรรมการให้คะแนน</p>
                            <p className="text-s">6. Scoreboard : แสดงสถานะคะแนนทุกทีมบนหน้าจอ Streamer</p>
                            <p className="text-s">7. กติกาการแข่ง : แสดงกติกาการเล่นของเกม</p>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Modal open={open} onClickBackdrop={() => { setOpen(false) }}>
                <Button size="sm" color="error" onClick={() => { setOpen(false) }}>ปิด</Button>
                <Modal.Header>เลือกคำถามที่ต้องการยิง</Modal.Header>
                <Modal.Body className="grid gap-2">
                    {
                        allQuestion && allQuestion.map((data) => {
                            return <Button color="warning" size="sm" variant="outline" className="w-full" key={data.id} onClick={() => { emitQuestion(data.id) }}>{data.id}</Button>
                        })
                    }
                </Modal.Body>
            </Modal>
        </div>
    );
}


export default AdminMainPage;