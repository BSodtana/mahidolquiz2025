import { PropTypes } from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Divider } from "react-daisyui";
import { FetchAnswer, FetchScore, FetchQuestionData, FetchFlowerStates } from "./helper";
import * as BsIcon from "react-icons/bs";
import { ENDPOINT } from "../../config";
import background from "../../../src/assets/background.png";
import logo from "../../../src/assets/logo_mquiz2025.png";
import AnswerFlower from "../../Competition/Components/Answer/items/AnswerFlower";
import { gsap } from "gsap";

const FLOWER_VARIANTS = ["blossom", "sunrise", "berry"];

const useReducedMotion = () => {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
};

const AnimatedResultFlower = ({ units = 0, outcome = "pending", variant = "blossom" }) => {
  const wrapperRef = useRef(null);
  const dropletRefs = useRef([]);
  const tlRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const droplets = dropletRefs.current.filter(Boolean);
    if (!wrapper) return () => {};
    gsap.set(wrapper, { scale: 1, rotation: 0 });
    droplets.forEach((drop) => gsap.set(drop, { autoAlpha: 0, y: 0 }));
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const droplets = dropletRefs.current.filter(Boolean);
    if (!wrapper) return;

    tlRef.current?.kill();

    if (outcome === "correct") {
      const tl = gsap.timeline();
      tl.to(wrapper, {
        scale: 1.12,
        duration: 0.35,
        ease: "back.out(1.7)",
      })
        .to(wrapper, {
          scale: 1,
          duration: 0.4,
          ease: "sine.out",
        });
      tl.fromTo(
        droplets,
        { autoAlpha: 0, y: 0 },
        {
          autoAlpha: 0.8,
          y: -28,
          duration: 0.55,
          ease: "power1.out",
          stagger: 0.08,
        },
        "<0.1"
      ).to(droplets, { autoAlpha: 0, duration: 0.3, ease: "sine.in" }, "-=0.2");
      tlRef.current = tl;
    } else if (outcome === "incorrect") {
      const tl = gsap.timeline();
      tl.to(wrapper, {
        scale: 0.9,
        rotation: -8,
        duration: 0.35,
        ease: "power2.inOut",
      }).to(wrapper, {
        scale: 1,
        rotation: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      tlRef.current = tl;
    } else {
      gsap.set(wrapper, { scale: 1, rotation: 0 });
      droplets.forEach((drop) => gsap.set(drop, { autoAlpha: 0, y: 0 }));
    }
  }, [outcome, reducedMotion]);

  const sanitizedUnits = Number.isFinite(units) ? units : 0;
  const dropletCount = 3;
  dropletRefs.current = dropletRefs.current.slice(0, dropletCount);

  return (
    <div className="relative flex flex-col items-center" aria-hidden="true">
      <div ref={wrapperRef} className="relative flex items-center justify-center">
        <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden="true">
          {Array.from({ length: dropletCount }).map((_, index) => (
            <span
              key={index}
              ref={(el) => (dropletRefs.current[index] = el)}
              className="block h-2 w-2 rounded-full bg-cyan-200/80"
            />
          ))}
        </div>
        <AnswerFlower
          size="sm"
          interactive={false}
          variant={variant}
          pollenCount={4}
          ariaLabel={`ดอกไม้ ${sanitizedUnits} ดอก`}
          tabIndex={-1}
        />
      </div>
      <span className="mt-2 text-sm font-semibold text-slate-600">{sanitizedUnits} ดอก</span>
    </div>
  );
};

function ShowAnswer({ CURRENT_QUESTION, QUESTION_OWNER, CURRENT_STATUS}) {
  const [answer, setAnswer] = useState(false);
  const [score, setScore] = useState();
  const [flowerStates, setFlowerStates] = useState({});

  useEffect(() => {
    if (CURRENT_QUESTION) {
      fetchAnswer(CURRENT_QUESTION);
    }
  }, [CURRENT_QUESTION]);

  useEffect(() => {
    if (CURRENT_STATUS === "SHOW_SUMMARY") {
      fetchScore(CURRENT_QUESTION);
    }
  }, [CURRENT_STATUS, CURRENT_QUESTION]);

  useEffect(() => {
    let isActive = true;
    const loadFlowerStates = async () => {
      try {
        const states = await FetchFlowerStates();
        if (!isActive) return;
        const mapped = {};
        (states ?? []).forEach((entry) => {
          if (!entry || !entry.team_id) return;
          mapped[entry.team_id] = entry.current_units ?? 0;
        });
        setFlowerStates(mapped);
      } catch (error) {
        console.error("Failed to load flower states", error);
        if (isActive) setFlowerStates({});
      }
    };
    loadFlowerStates();
    return () => {
      isActive = false;
    };
  }, [CURRENT_STATUS, CURRENT_QUESTION]);

  const fetchAnswer = async (q_id) => {
    let data = await FetchAnswer(q_id);
    setAnswer(data);
  };

  const fetchScore = async (q_id) => {
    let score = await FetchScore(q_id)
    console.log(score)
    setScore(score)
  }

  const filterScore = (user_id) => {
    if (score?.score) {
      let score_data = score?.score.filter((data) => {
        return data.user_id === user_id
      })
      return score_data[0]?.score
    }
  }
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
  console.log(question)

  return (
    <div className="relative flex flex-col items-center justify-center h-screen"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
      <img src={logo} alt="Mahidol Quiz" className="absolute top-6 left-6 w-28 drop-shadow-xl" />
      <div className="grid rounded-lg bg-opacity-90 bg-white text-gray-700 shadow-2xl text-center text-3xl w-11/12 animate__animated animate__fadeInUp p-5 mb-5" style={{ animationDelay: "500ms" }}>
        
        {CURRENT_STATUS === "SHOW_SUMMARY" ? 
        <><p className="animate__animated animate__fadeInUp">คำตอบที่ถูกต้อง<br />
              { question && question.underline !== null? (<>
                <u>{question.underline}</u>
              </>)
              : 
              (<>
              <strong>
                {question && question.correct_answer}
                </strong>
                </>)}
        </p>


         {/* {
            (score?.question_data[0].correct_answer_description) && (
              <p className="text-xl animate__animated animate__fadeInUp">
                <Divider className="animate__animated animate__fadeInUp"><strong>คำอธิบาย</strong></Divider>
                {score && score?.question_data[0].correct_answer_description?.split("<br/>").map((i) => {
                  return (<><span>{i}</span> <br /></>)
                })}
              </p>
            )
          } */}

          <div className="animate__animated animate__fadeInUp flex justify-center">
            {score?.question_data[0].correct_answer_photo && <img className="h-80" src={`${ENDPOINT}/static/${score?.question_data[0].correct_answer_photo}`} />}
          </div>
        </> : "คำตอบของผู้เข้าแข่งขัน"}
      </div>
      <div className="ml-10 mr-10 grid grid-cols-5 gap-6">
        {answer &&
          answer.map((data, index) => {
            const pastelPalettes = [
              "from-rose-100 via-pink-50 to-amber-100",
              "from-sky-100 via-emerald-50 to-lime-100",
              "from-indigo-100 via-violet-50 to-rose-100",
              "from-amber-100 via-orange-50 to-pink-100",
              "from-teal-100 via-cyan-50 to-sky-100",
            ];
            const gradient = pastelPalettes[index % pastelPalettes.length];
            const scoreValue = filterScore(data.user_id);
            const hasPositiveScore = Number(scoreValue) > 0;
            const units = flowerStates?.[data.user_id] ?? 0;
            const variant = FLOWER_VARIANTS[Math.abs(units) % FLOWER_VARIANTS.length];
            const outcome = CURRENT_STATUS === "SHOW_SUMMARY"
              ? (hasPositiveScore ? "correct" : "incorrect")
              : "pending";

            return (
              <div
                key={index}
                className={`relative col-span-1 h-[350px] rounded-3xl border border-white/60 bg-gradient-to-br ${gradient} shadow-xl shadow-sky-100/40 backdrop-blur-sm animate__animated animate__fadeInDown`}
                style={{ animationDelay: `${750 + index * 175}ms` }}
              >
                <div className="absolute inset-x-6 top-5 h-2 rounded-full bg-white/50"></div>
                <div className="absolute -top-10 left-6 w-16 h-16 rounded-full bg-white/70 blur-2xl"></div>
                <div className="absolute -bottom-8 right-8 w-20 h-20 rounded-full bg-white/60 blur-3xl"></div>
                <div className="relative flex flex-col h-full p-6 text-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <p className="text-xl font-semibold truncate drop-shadow-sm">
                        {data.owner_name}
                      </p>
                      {QUESTION_OWNER === data.user_id ? (
                        <Badge color="warning" className="mt-1 w-fit bg-amber-200 border-none text-amber-900 font-semibold shadow-sm">
                          เจ้าของคำถาม
                        </Badge>
                      ) : null}
                    </div>
                    <AnimatedResultFlower units={units} outcome={outcome} variant={variant} />
                  </div>
                  <div className="mt-4 flex-1 overflow-y-auto rounded-2xl bg-white/55 p-4 text-lg leading-relaxed shadow-inner shadow-emerald-100/40">
                    {data.answer || <span className="italic text-gray-500">ยังไม่มีคำตอบ</span>}
                  </div>
                  {CURRENT_STATUS === "SHOW_SUMMARY" ? (
                    <div className="mt-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-3xl font-bold shadow-md ${
                          hasPositiveScore ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
                        }`}
                      >
                        {scoreValue ?? "-"}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="pointer-events-none absolute -right-3 bottom-6 h-16 w-16 rounded-full border-4 border-white/60 bg-white/50 blur-sm"></div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

ShowAnswer.propTypes = {
  CURRENT_QUESTION: PropTypes.string.isRequired,
  QUESTION_OWNER: PropTypes.string.isRequired,
  CURRENT_STATUS: PropTypes.string.isRequired
}

export default ShowAnswer;
