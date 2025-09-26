import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScoreRanking } from "./helper";
import background from "../../../src/assets/background.png";
import logo from "../../../src/assets/logo_mquiz2025.png";
import item3 from "../../Competition/Components/Answer/items/item3.png";
import item4 from "../../Competition/Components/Answer/items/item4.png";
import item5 from "../../Competition/Components/Answer/items/item5.png";
import item6 from "../../Competition/Components/Answer/items/item6.png";
import item7 from "../../Competition/Components/Answer/items/item7.png";
import addIcon from "../../../src/assets/add_icon.png";
import reviveIcon from "../../../src/assets/revive_icon.png";
import shieldIcon from "../../../src/assets/shield_icon.png";
import { gsap } from "gsap";

const FLOWER_LEVELS = {
  3: { src: item3, petals: 3, leaves: 0 },
  4: { src: item4, petals: 3, leaves: 1 },
  5: { src: item5, petals: 4, leaves: 1 },
  6: { src: item6, petals: 4, leaves: 2 },
  7: { src: item7, petals: 5, leaves: 2 },
};

const DEFAULT_FLOWER_LEVEL = { src: item3, petals: 3, leaves: 0 };

const MAX_ITEM_COUNTS = {
  ADD: 2,
  REVIVE: 1,
  SHIELD: 1,
};

const ITEM_DETAILS = {
  ADD: { icon: addIcon, label: "Add" },
  REVIVE: { icon: reviveIcon, label: "Revive" },
  SHIELD: { icon: shieldIcon, label: "Shield" },
};

const resolveFlowerVisual = (rawUnits) => {
  const numericUnits = Number(rawUnits);
  if (!Number.isFinite(numericUnits) || numericUnits <= 0) {
    return { ...DEFAULT_FLOWER_LEVEL, units: 0, hasFlower: false };
  }

  const clampedUnits = Math.min(7, Math.max(3, Math.round(numericUnits)));
  const level = FLOWER_LEVELS[clampedUnits] ?? DEFAULT_FLOWER_LEVEL;
  return { ...level, units: numericUnits, hasFlower: true };
};

const computeItemsLeft = (rawItems) => {
  const usedCounts = { ADD: 0, REVIVE: 0, SHIELD: 0 };

  (rawItems ?? "")
    .split(",")
    .map((item) => item && item.trim().toUpperCase())
    .filter(Boolean)
    .forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(usedCounts, item)) {
        usedCounts[item] += 1;
      }
    });

  const remaining = {};
  Object.entries(MAX_ITEM_COUNTS).forEach(([item, maxCount]) => {
    const used = usedCounts[item] ?? 0;
    remaining[item] = Math.max(0, maxCount - used);
  });

  return remaining;
};

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
      <img
        src={logo}
        alt="Mahidol Quiz"
        className="absolute top-6 left-6 w-56 md:w-64 drop-shadow-xl"
      />
      <div className="w-11/12 max-w-4xl bg-white bg-opacity-95 backdrop-blur rounded-3xl shadow-2xl p-6 animate__animated animate__fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Scoreboard</h2>
          <span className="text-lg text-gray-600">คะแนนรวม พร้อมดอกไม้คงเหลือและไอเท็มที่เหลือ</span>
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

              const flowerVisual = resolveFlowerVisual(data.flower_units);
              const itemsLeft = computeItemsLeft(data.items_used);
              const itemsLeftList = Object.entries(itemsLeft).filter(([, count]) => count > 0);

              return (
                <div
                  key={data.user_id ?? index}
                  className={`grid grid-cols-[0.5fr_1.5fr_auto_minmax(0,1.8fr)_auto] gap-5 items-center rounded-2xl px-6 py-3 shadow-lg ${accentClass}`}
                  ref={registerRowRef(index)}
                >
                  <div className="text-lg font-bold"># {index + 1}</div>
                  <div className="text-2xl font-semibold truncate min-w-0">{data.owner_name}</div>
                  <div className="flex items-center gap-3">
                    {flowerVisual.hasFlower ? (
                      <>
                        <img
                          src={flowerVisual.src}
                          alt={`${flowerVisual.units} flower units`}
                          className="h-20 w-20 object-contain select-none"
                          draggable="false"
                        />
                        <span className="text-lg font-bold text-gray-900">
                          {flowerVisual.units}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">ไม่มีดอกไม้</span>
                    )}
                  </div>
                  <div className="text-base font-medium flex flex-wrap items-center gap-2">
                    {itemsLeftList.length ? (
                      itemsLeftList.map(([item, count]) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-sm font-semibold text-gray-700 shadow-sm"
                        >
                          {ITEM_DETAILS[item]?.icon ? (
                            <img
                              src={ITEM_DETAILS[item].icon}
                              alt={`${ITEM_DETAILS[item].label} icon`}
                              className="h-10 w-10 select-none"
                              draggable="false"
                            />
                          ) : (
                            <span className="text-base" title={item}>
                              {item}
                            </span>
                          )}
                          <span>x{count}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">ไม่มีไอเท็ม</span>
                    )}
                  </div>
                  <div ref={registerScoreRef(index)} className="text-3xl font-black text-right">
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
