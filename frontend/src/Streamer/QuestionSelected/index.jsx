import React, { forwardRef, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FetchQuestionData } from "./helper";
import mainLogo from "../../../src/assets/logo_mquiz2025.png";
import cornerLogo from "../../../src/assets/logo_mquiz2025.png";
import { PropTypes } from "prop-types";
import background from "../../../src/assets/background.png";

function StreamerWaitMc({ CURRENT_QUESTION }) {
  const [question, setQuestion] = useState();
  const containerRef = useRef(null);
  const messageRef = useRef(null);
  const hourglassRef = useRef(null);

  useEffect(() => {
    if (CURRENT_QUESTION) {
      fetchQuestion(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);

  const fetchQuestion = async (questionId) => {
    try {
      let data = await FetchQuestionData(questionId);
      setQuestion(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (messageRef.current) {
        gsap.fromTo(
          messageRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }

      if (hourglassRef.current) {
        gsap.set(hourglassRef.current, { transformOrigin: "50% 50%" });
        gsap.fromTo(
          hourglassRef.current,
          { rotation: -10, scale: 0.95 },
          {
            rotation: 10,
            scale: 1,
            duration: 1.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [question]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img src={mainLogo} className="pb-10 h-1/4" alt="Mahidol Quiz" />
      <div
        ref={messageRef}
        className="px-8 py-6 rounded-3xl bg-white/90 text-gray-800 shadow-2xl max-w-4xl text-center"
      >
        <p className="text-4xl font-bold mb-3">
          {question ? (
            <>
              {question.id} {question.level && "ระดับ"} {question.level}
            </>
          ) : (
            <>กำลังเตรียมข้อมูลคำถาม...</>
          )}
        </p>
        <p className="text-3xl font-bold mb-3">
          {question ? (
            <>
              <strong>{question.score} คะแนน</strong>
              {question.time && <> | {question.time} วินาที</>}
            </>
          ) : (
            <>กรุณารอสักครู่</>
          )}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 text-xl text-gray-600">
          <span className="text-2xl font-bold mb-3">
            กำลังรอทีมตัดสินใจใช้ไอเท็ม
          </span>
          <HourglassIcon ref={hourglassRef} className="w-16 h-16" />
        </div>
      </div>
    </div>
  );
}

const HourglassIcon = forwardRef((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <g stroke="#0B3D91" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 12h48" />
      <path d="M24 84h48" />
      <path d="M30 12v18c0 11 18 20 18 20s18-9 18-20V12" />
      <path d="M30 84V66c0-11 18-20 18-20s18 9 18 20v18" />
    </g>
    <path d="M33 12h30v18c0 9-15 16-15 16s-15-7-15-16V12z" fill="#5FD0D7" />
    <path d="M33 84h30V66c0-9-15-16-15-16s-15 7-15 16v18z" fill="#1692C6" />
  </svg>
));

HourglassIcon.displayName = "HourglassIcon";

StreamerWaitMc.propTypes = {
  CURRENT_QUESTION: PropTypes.string,
};

export default StreamerWaitMc;
