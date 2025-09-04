import React, { useEffect, useState, useRef } from 'react';
import { Alert, Badge, Button, Card, Divider, Form, Input, InputGroup } from 'react-daisyui';
import toast, { Toaster } from "react-hot-toast"
import * as BsIcon from 'react-icons/bs';
import { FetchQuestionData, FetchUserAnswer, GetUserItems, GetUserScore, timeFormat, UpdateScore, } from './helper';
import { SocketConnection } from './socket';
import { ENDPOINT } from '../../config';

function ProfessorChecking() {
    const [, gameStatus, questionOwner, loop, currentQuestionSelect, countdownUntil,] = SocketConnection()
    const [question, setQuestion] = useState(false)
    const [answers, setAnswers] = useState(false)
    const [isOwnerWrong, setIsOwnerWrong] = useState(false)
    const [itemsUsed, setItemUsed] = useState(false)
    const [streak, setStreak] = useState()
    const [score, setScore] = useState()
    const ref = useRef()
    const user = JSON.parse(localStorage.getItem("user"))

    useEffect(() => {
        if (currentQuestionSelect) {
            fetchQuestionData(currentQuestionSelect)
            fetchScore()
        }
    }, [currentQuestionSelect])

    useEffect(() => {
        if (gameStatus === "AWAIT_SCORE") {
            fetchUserAnswer(currentQuestionSelect)
            fetchItemUsed(currentQuestionSelect)
        }
    }, [countdownUntil, currentQuestionSelect, gameStatus])

    const fetchQuestionData = async (q_id) => {
        try {
            let q = await FetchQuestionData(q_id)
            setQuestion(q)
        } catch (err) {
            console.log(err)
        }
    }

    const fetchUserAnswer = async (q_id) => {
        try {
            let data = await FetchUserAnswer(q_id)
            setAnswers(data)
        } catch (err) {
            console.log(err)
        }
    }

    const submitScore = async (user_id, score) => {
        await UpdateScore(user_id, score, currentQuestionSelect)
        toast.success(`บันทึกคะแนนของผู้ใช้ ${user_id} = ${score} คะแนน สำเร็จแล้ว`)
        fetchScore()
    }

    const fetchItemUsed = async (question_id) => {
        let data = await GetUserItems(question_id)
        setItemUsed(data.items)
        setStreak(data.streak_active)
    }

    const filterUsedItem = (user_id) => {
        if (itemsUsed) {
            let filtered = itemsUsed?.filter((data) => { return data.user_id === user_id })
            return filtered;
        }
        return null;
    }

    const fetchScore = async () => {
        try {
            let score = await GetUserScore(currentQuestionSelect);
            setScore(score)
        } catch (err) {
            alert("ERROR")
        }
    }

    const filterScore = (user_id) => {
        let filtered = score?.filter((data) => { return user_id === data.user_id })
        return filtered[0]?.score
    }

    return (
        <div className="p-4">
            <Toaster position="top-center" reverseOrder={false} />
            <Alert innerClassName="flex justify-around" className="shadow-xl glass">
                <p>สถานะเกมปัจจุบัน : {`${gameStatus}`}</p>
                <p>ลูป : {loop}</p>
                <p>คำถามข้อปัจจุบัน : {currentQuestionSelect ? currentQuestionSelect : "NONE"}</p>
                <p>ทีมเจ้าของคำถาม : {questionOwner ? questionOwner : "NONE"}</p>
                <p>เหลือเวลาอีก {timeFormat(countdownUntil)} นาที</p>
            </Alert>
            <Card className="w-full shadow-xl mt-2 bg-white bg-opacity-80" style={{minHeight: '500px'}}>
                <Card.Body>
                    <Card.Title>
                        หมวด {question && question.type} - {question && question.score} คะแนน - {question && question.time} วินาที
                    </Card.Title>

                    {question && question.type === "FINAL"? (<>
                        <p>
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
                        <p>
                            {question.text}
                            <div className="flex justify-center pt-6">
                                {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='min-h-[350px] max-h-[350px] p-2'></img>}
                            </div>
                        </p>
                    </>
                )}

                    <Divider />
                    <p><b>เฉลยจากระบบ: </b> {(question?.correct_answer) && question?.correct_answer}</p>
                    <p><b>คำอธิบายเฉลย: </b> {(question?.correct_answer_description) && question?.correct_answer_description}</p>
                </Card.Body>
                {console.log('data:', question)}
            </Card>
            {gameStatus === "AWAIT_SCORE" &&
                <div className="grid grid-cols-4 gap-1">
                    {
                        answers && answers.map((data, index) => {
                            return <Card key={index} className="flex w-full h-full shadow-xl mt-5 bg-white bg-opacity-80">
                                <Card.Body >
                                    <Card.Title>{data.owner_name} {data.user_id === questionOwner ? (<Badge size="lg" color="warning">ทีมเจ้าของคำถาม</Badge>) : null}</Card.Title>
                                    <div className="text-xl text-center text-gray-700 h-48 overflow-y-auto">{data.answer}</div>
                                    <p>คะแนนในระบบ: {filterScore(data.user_id) ? filterScore(data.user_id) : "No Data"}</p>
                                    <div className="flex justify-around">
                                        {
                                            user.role === "teacher"
                                               ? <div className="flex">
                                                    {/* <p className="text-error">ACTIVE ITEMS</p> {
                                                        filterUsedItem(data.user_id) && filterUsedItem(data.user_id).map((data, index) => {
                                                            return <p key={index}>- {data.item_id}</p>
                                                        })
                                                    }{streak && streak.includes(data.user_id) ? <Badge color="error">ทีมนี้มี STREAK!</Badge> : null} */}
                                                    <Form  onSubmit={(e) => { e.preventDefault(); submitScore(data.user_id, e.target.value.value) }}>
                                                        <InputGroup  className="grid grid-cols-3">
                                                            <span>คะแนน</span>
                                                            <Input type="text" name="value" placeholder="กรอกคะแนน" ref={ref} bordered onBlur={(e) => { submitScore(data.user_id, e.target.value) }} />
                                                            <span>&nbsp;เต็ม&nbsp;{question ? question?.score : '0'}</span>

                                                        </InputGroup>
                                                        <Button type='submit' className='mt-3'>Save</Button>
                                                    </Form>
                                                </div>
                                                : <></>
                                        }
                                    </div>
                                </Card.Body>
                            </Card>
                        })
                    }
                </div>
            }
        </div>
    );
}

export default ProfessorChecking