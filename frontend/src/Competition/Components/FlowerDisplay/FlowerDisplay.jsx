import React from "react";
import {
  limitFlowerUnits,
  calcMultiplier,
  getStateName,
  getStateClasses,
  MIN_UNITS,
  MAX_UNITS,
} from "./flowerHelpers";
export default function FlowerDisplay({
  currentUnits = 5,
  showMultiplier = true,
  isCurrentTeam = false,
  className = "",
}) {
  
  const units = limitFlowerUnits(currentUnits);
  const multiplierVal = calcMultiplier(units);
  const multiplierText = `${multiplierVal.toFixed(1)}x`;
  const stateName = getStateName(units);
  const toneClass = getStateClasses(stateName);
  const petals = Math.min(units, 5);
  const leaves = Math.max(0, units - 5);
  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      title={`Flower ${units}/5 • Multiplier ${multiplierText}`}
    >
      <div
        className={[
          "relative w-28 h-28 rounded-full",
          "bg-base-200/60 flex items-center justify-center",
          isCurrentTeam ? "ring ring-offset-2 ring-primary" : "",
        ].join(" ")}
      >
        {[...Array(5)].map((_, i) => {
          const angleRad = (i / 5) * 2 * Math.PI;
          const angleDeg = (angleRad * 180) / Math.PI;
          const isFilled = i < petals;
          return (
            <div
              key={i}
              className={[
                "absolute w-6 h-10 rounded-t-full origin-bottom",
                isFilled ? `${toneClass} bg-current` : "bg-neutral/30",
              ].join(" ")}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -100%) rotate(${angleDeg}deg)`,
              }}
            />
          );
        })}

        {leaves >= 1 && (
          <div
            className={[
              "absolute bottom-2 left-3 w-4 h-6",
              "rounded-bl-full rounded-tr-full",
              "rotate-[-25deg]",
              `${toneClass} bg-current`,
            ].join(" ")}
          />
        )}
        {leaves >= 2 && (
          <div
            className={[
              "absolute bottom-2 right-3 w-4 h-6",
              "rounded-br-full rounded-tl-full",
              "rotate-[25deg]",
              `${toneClass} bg-current`,
            ].join(" ")}
          />
        )}

        <div className="absolute w-10 h-10 rounded-full bg-base-100 shadow flex items-center justify-center">
          <span className="text-sm font-semibold">{units}/5</span>
        </div>
      </div>

      {showMultiplier && (
        <div className={`text-sm font-semibold ${toneClass}`}>{multiplierText}</div>
      )}
    </div>
  );
}

