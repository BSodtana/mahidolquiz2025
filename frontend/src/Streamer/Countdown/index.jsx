import React, { useState, useEffect } from 'react';
import { FetchQuestionData } from './helper';
import { timeFormat } from '../../Competition/Components/Answer/helper';
import * as BsIcon from "react-icons/bs"
import { ENDPOINT } from '../../config';
import { PropTypes } from "prop-types"
import Zoom from 'react-medium-image-zoom';


function StreamerCountdown({ TIME_LEFT, CURRENT_QUESTION }) {
    const [question, setQuestion] = useState()

    useEffect(() => {
        if (CURRENT_QUESTION) {
            fetchQuestion(CURRENT_QUESTION)
        }
    }, [CURRENT_QUESTION])


    const fetchQuestion = async (question) => {
        try {
            let q = await FetchQuestionData(question);
            setQuestion(q);
        } catch (error) {
            console.error("Error fetching question data:", error);
        }
    };

    const renderImage = (src, altText) => (
        <Zoom
        zoomMargin={40}                           
        transitionDuration={500}                  
        >
            <img 
                src={`${ENDPOINT}/static/${src}`} 
                className='min-h-[350px] max-h-[350px] p-2' 
                alt={altText} 
            />
        </Zoom>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white-blur text-gray-700 p-2 gap-5">
            <div className="grid grid-cols-3 p-5 rounded-lg bg-white shadow-2xl bg-opacity-100 text-center text-3xl w-9/12 animate__animated animate__fadeInUp">
                <div className="flex justify-around"><BsIcon.BsClock /> {timeFormat(TIME_LEFT)}</div>
                <div className="flex justify-around"><BsIcon.BsTrophy /> {question && question.score} คะแนน</div>
                <div className="flex justify-around"><BsIcon.BsStack /> {question && question.type}</div>
            </div>
            <div className="p-5 rounded-lg bg-white bg-opacity-90 shadow-2xl w-9/12 animate__animated animate__fadeInUp m-10" style={{ animationDelay: "500ms" }}>
                    {question && question.type === "FINAL"? (<>
                        <p className="text-2xl">
                            {question.majorq}
                        <div className="flex justify-center pt-6">
                            <Zoom>
                                {question.majorpics && <img src={`${ENDPOINT}/static/${question.majorpics}`} className='min-h-[150px] max-h-[200px] p-2'></img>}
                            </Zoom>
                        </div>
                        {question.text}{" "}<u>{question.underline}</u>
                        </p>
                    <div className="flex justify-center pt-6">
                        <Zoom>
                            {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='min-h-[350px] max-h-[350px] p-2'></img>}
                        </Zoom>
                        
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
            </div>
        </div>
    );
}




StreamerCountdown.propTypes = {
    TIME_LEFT: PropTypes.number,
    CURRENT_QUESTION: PropTypes.string
};



export default StreamerCountdown;