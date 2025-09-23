import React, { useEffect, useRef, useState } from 'react';
import { FetchQuestionData } from './helper';
import { timeFormat } from '../../Competition/Components/Answer/helper';
import * as BsIcon from "react-icons/bs"
import { ENDPOINT } from '../../config';
import { PropTypes } from "prop-types"
import Zoom from 'react-medium-image-zoom';
import background from "../../../src/assets/background.png"
import logo from "../../../src/assets/logo_mquiz2025.png"
import { gsap } from "gsap";


function StreamerCountdown({ TIME_LEFT, CURRENT_QUESTION }) {
    const [question, setQuestion] = useState()
    const [animatedTime, setAnimatedTime] = useState(TIME_LEFT ?? 0)
    const previousTimeRef = useRef()
    const clockRef = useRef(null)

    useEffect(() => {
        if (CURRENT_QUESTION) {
            fetchQuestion(CURRENT_QUESTION)
        }
    }, [CURRENT_QUESTION])

    useEffect(() => {
        if (typeof TIME_LEFT !== "number") {
            return;
        }

        const startValue = typeof previousTimeRef.current === "number" ? previousTimeRef.current : TIME_LEFT;
        setAnimatedTime(Math.max(0, Math.round(startValue)));

        const counter = { value: startValue };
        const tween = gsap.to(counter, {
            value: TIME_LEFT,
            duration: 0.5,
            ease: "power1.out",
            onUpdate: () => {
                setAnimatedTime(Math.max(0, Math.round(counter.value)));
            },
        });

        if (clockRef.current) {
            gsap.fromTo(
                clockRef.current,
                { scale: 1.25 },
                { scale: 1, duration: 0.3, ease: "back.out(2)" }
            );
        }

        previousTimeRef.current = TIME_LEFT;
        return () => tween.kill();
    }, [TIME_LEFT]);


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

    const critical = typeof TIME_LEFT === "number" && TIME_LEFT <= 10;

    return (
    <div className="relative flex flex-col items-center justify-center h-screen"
        style={{
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
        <img src={logo} alt="Mahidol Quiz" className="absolute top-6 left-6 w-28 drop-shadow-xl" />
        {/* Header Block - No Change */}
        <div className="grid grid-cols-3 p-5 rounded-lg bg-white shadow-2xl bg-opacity-100 text-center text-3xl w-11/12 animate__animated animate__fadeInUp">
            <div ref={clockRef} className={`flex justify-around transition-colors duration-200 ${critical ? 'text-red-600' : ''}`}>
                <BsIcon.BsClock /> {timeFormat(animatedTime)}
            </div>
            <div className="flex justify-around"><BsIcon.BsTrophy /> {question && question.score} คะแนน</div>
            <div className="flex justify-around"><BsIcon.BsStack /> {question && question.type}</div>
        </div>

        {/* Content Block - Optimized */}
        <div className="p-5 rounded-lg bg-white bg-opacity-95 shadow-2xl w-11/12 animate__animated animate__fadeInUp m-10 flex flex-col justify-center items-center text-center"
             style={{ animationDelay: "500ms" }}> 
            {question && question.type === "FINAL" ? (
                <>
                    <p className="text-2xl mb-4">{question.majorq}</p>
                    <div className="flex justify-center w-full">
                        {question.majorpics && <img src={`${ENDPOINT}/static/${question.majorpics}`} className='max-h-60 w-auto object-contain'></img>}
                    </div>
                    <p className="text-2xl mt-4 mb-4">
                        {question.text}{" "}<u>{question.underline}</u>
                    </p>
                    <div className="flex justify-center w-full">
                        {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='max-h-80 w-auto object-contain'></img>}
                    </div>
                </>
            ) : (question &&
                <>
                    <p className="text-2xl mb-4">{question.text}</p>
                    <div className="flex justify-center w-full">
                        {question.pics && <img src={`${ENDPOINT}/static/${question.pics}`} className='max-h-80 w-auto object-contain'></img>}
                    </div>
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
