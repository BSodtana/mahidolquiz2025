import React, { useEffect, useState, useRef } from 'react';
import { Alert, Badge, Button, Card, Divider, Form, Input, InputGroup } from 'react-daisyui';
import toast, { Toaster } from "react-hot-toast"
import * as BsIcon from 'react-icons/bs';
import { FetchQuestionData, FetchUserAnswer, GetUserItems, GetUserScore, timeFormat, UpdateScore, getFlowerState, changeFlowerState, checkFlowerState,updateFlowerStatus, GetItemRealtime} from './helper';
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
            //fetchItemUsed(currentQuestionSelect)
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

    const limitScore = (score) => {
        return Math.max(3, Math.min(score, 7));
    };
    
    // Pull flower multiplier
    const submitScore = async (user_id, score) => {
        let flower = await getFlowerState(user_id);
        let { is_rewards: reward, is_early_submission: early , flower_no: flower_no, is_protect:is_protect} = await checkFlowerState(user_id, currentQuestionSelect);
        let finalFlower = (reward == 0) ? flower : flower_no;
        let text;
        if (reward === 1) {
            //console.log("Reward used, flower from reward: ", flower_no);
        }
        // Check item used
        /*
        if(item_used == 1){
            new_flower += 1;
        }else if(item_used == -1){
            new_flower = 5;
        }*/
        finalFlower = limitScore(finalFlower);
        await UpdateScore(user_id, score, currentQuestionSelect, finalFlower)
        toast.success(`ทีม ${user_id}, ได้คะแนนดิบ ${score} x (${finalFlower} ดอก / 5) = ${(score * finalFlower) / 5} คะแนน`)
        // การจัดการดอกไม้มีปัญหา ให้ +- ส่งผลรอบหน้า (Working)
        if (early == 1 && score > 0) {
            finalFlower += 1;
            text = "เพิ่มกลีบดอกไม้เนื่องจากส่งคำตอบก่อนเวลา +1 ";
            toast.success(text);
        } else if (score == 0 && is_protect == 1) {
            text = "ป้องกันไม่ให้กลีบดอกไม้ลดลงเมื่อคำตอบไม่ถูกต้อง -1 (ใช้ไอเท็ม SHIELD)";
            toast.success(text);
        } else if (score == 0) {
            finalFlower -= 1;
            text = "ลดกลีบดอกไม้เนื่องจากคำตอบไม่ถูกต้อง -1 ";
            toast.success(text);
        } else {
            text = "ไม่มีการเปลี่ยนแปลงดอกไม้ หรือผลจากไอเท็ม";
        }
        finalFlower = limitScore(finalFlower);

        if(reward == 0){
            await changeFlowerState(user_id, flower, finalFlower, text, currentQuestionSelect);
            await updateFlowerStatus(user_id, early, 1, flower, currentQuestionSelect);
            //console.log("flower to new_flower", flower, finalFlower);
        }else{
            await changeFlowerState(user_id, flower_no, finalFlower, text, currentQuestionSelect);
            await updateFlowerStatus(user_id, early, 1, flower_no, currentQuestionSelect);
            //console.log("reward flower to new_flower", flower_no, finalFlower);
        }
        //await updateFlowerStatus(user_id, 0, 0, flower, currentQuestionSelect);
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
                                    {/*<p>คะแนนในระบบ: {filterScore(data.user_id) ? (filterScore(data.user_id)*(cur_status_flower/5)) : "No Data"}</p>*/}
                                    <div className="flex justify-around">
                                        {
                                            user.role === "teacher"
                                               ? <div className="flex">
                                                    <Form  onSubmit={(e) => { e.preventDefault(); }}>
                                                        <InputGroup  className="grid grid-cols-3">
                                                            <Button
                                                                    color="error" // สีแดง
                                                                    size="md"
                                                                    onClick={() => submitScore(data.user_id, 0)}
                                                                >
                                                                <BsIcon.BsX />
                                                            </Button>
                                                            <Input className="text-center" type="text" readOnly bordered value={filterScore(data.user_id) !== "No Data" ? filterScore(data.user_id) : ""} />
                                                            {/*<span>&nbsp;เต็ม&nbsp;{question ? question?.score : '0'}</span>*/}
                                                            <Button
                                                                    color="success"
                                                                    size="md"
                                                                    onClick={() => submitScore(data.user_id, question ? question?.score : 0)}
                                                                >
                                                                <BsIcon.BsCheck2Circle />
                                                            </Button>
                                                        </InputGroup>
                                                        {/*<Button type='submit' className='mt-3'>Save</Button>*/}
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
