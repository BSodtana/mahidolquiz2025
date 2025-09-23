import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScoreRanking } from "./helper";
import background from "../../../src/assets/background.png";
import logo from "../../../src/assets/logo_mquiz2025.png";
import { gsap } from "gsap";

function StreamerScore() {
  const [score, setScore] = useState(null);
  const containerRef = useRef(null);
  const rowRefs = useRef([]);
  const scoreRefs = useRef([]);

  useEffect(() => {
    const getScore = async () => {
      let score = await ScoreRanking();
      setScore(score);
    };

    getScore();
  }, []);

  useLayoutEffect(() => {
    if (!score || !score.length) {
      return;
    }

    rowRefs.current = rowRefs.current.slice(0, score.length);
    scoreRefs.current = scoreRefs.current.slice(0, score.length);

    const ctx = gsap.context(() => {
      gsap.set(rowRefs.current, { autoAlpha: 0, scale: 0.8 });
      scoreRefs.current.forEach((el) => {
        if (el) {
          el.textContent = "0";
        }
      });

      const timeline = gsap.timeline();
      const topThree = rowRefs.current.slice(0, 3);
      const rest = rowRefs.current.slice(3);

      topThree.forEach((row, index) => {
        if (!row) {
          return;
        }

        timeline.to(
          row,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.6)",
            onComplete: () => animateScore(index),
          },
          index === 0 ? "+=1" : "+=0.6"
        );
      });

      if (rest.length) {
        timeline.to(
          rest,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.45,
            ease: "back.out(1.4)",
            stagger: 0,
            onComplete: () => {
              rest.forEach((_, idx) => animateScore(idx + 3));
            },
          },
          "+=0.3"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [score]);

  const registerRowRef = (index) => (el) => {
    rowRefs.current[index] = el;
  };
  const registerScoreRef = (index) => (el) => {
    scoreRefs.current[index] = el;
  };

  const animateScore = (index) => {
    const targetEl = scoreRefs.current[index];
    const rowData = score?.[index];
    if (!targetEl || !rowData) {
      return;
    }

    const rawScore = rowData.score ?? 0;
    const numericScore = Number(rawScore);
    const rawString = typeof rawScore === "string" ? rawScore : `${rawScore}`;
    const decimals = rawString.includes(".") ? rawString.split(".")[1].length : 0;

    const counter = { value: 0 };
    gsap.to(counter, {
      value: numericScore,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        const currentValue = decimals > 0 ? counter.value.toFixed(decimals) : Math.round(counter.value).toString();
        targetEl.textContent = currentValue;
      },
      onComplete: () => {
        targetEl.textContent = decimals > 0 ? numericScore.toFixed(decimals) : `${numericScore}`;
      },
    });
  };

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
      <img src={logo} alt="Mahidol Quiz" className="absolute top-6 left-6 w-28 drop-shadow-xl" />
      <div className="w-10/12 max-w-4xl bg-white bg-opacity-95 backdrop-blur rounded-3xl shadow-2xl p-8 animate__animated animate__fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Scoreboard</h2>
          <span className="text-lg text-gray-600">คะแนนรวม พร้อมดอกไม้คงเหลือและไอเท็มที่ใช้</span>
        </div>
        <div className="flex flex-col gap-4">
          {score &&
            score.map((data, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;

              let accentClass = "bg-white/90 text-gray-800";
              if (isGold) {
                accentClass = "bg-yellow-200 text-gray-900";
              } else if (isSilver) {
                accentClass = "bg-gray-300 text-gray-900";
              } else if (isBronze) {
                accentClass = "bg-orange-200 text-gray-900";
              }

              const flowerUnits = data.flower_units ?? 0;
              const itemIconMap = {
                ADD: "➕",
                REVIVE: "✨",
                SHIELD: "🛡️",
              };

              const itemsUsed = (data.items_used ?? "")
                .split(",")
                .map((item) => item && item.trim())
                .filter(Boolean);

              return (
                <div
                  key={data.user_id ?? index}
                  className={`grid grid-cols-5 gap-4 items-center rounded-2xl px-6 py-4 shadow-lg ${accentClass}`}
                  ref={registerRowRef(index)}
                >
                  <div className="text-2xl font-bold"># {index + 1}</div>
                  <div className="text-2xl font-semibold truncate">{data.owner_name}</div>
                  <div className="text-xl font-semibold flex items-center gap-2">
                    <span role="img" aria-label="flower" className="text-3xl">
                      🌸
                    </span>
                    <span>{flowerUnits}</span>
                  </div>
                  <div className="text-lg font-medium flex items-center gap-2">
                    {itemsUsed.length
                      ? itemsUsed.map((item) => (
                          <span key={item} title={item} className="text-2xl">
                            {itemIconMap[item] ?? item}
                          </span>
                        ))
                      : "-"}
                  </div>
                  <div ref={registerScoreRef(index)} className="text-4xl font-black text-right">
                    {data.score}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default StreamerScore;
