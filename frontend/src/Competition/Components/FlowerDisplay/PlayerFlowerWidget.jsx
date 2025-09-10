import React from "react";
import FlowerDisplay from "./FlowerDisplay";
import { useFlowerState } from "/src/Competition/useFlowerState.js";
import { getStateName, getStateClasses } from "./flowerHelpers";
export default function PlayerFlowerWidget({ team_id, mock = false, compact = false }) {
  const flower = useFlowerState(team_id, { mock });
  // Skip only while hook is not ready
  if (!flower) return null;
  const { units = 0, multiplier = 1, loading = false, error = null } = flower;
  const stateName = getStateName(units); // "critical/declining/healthy"
  const colorClass = getStateClasses(stateName);
  //compact Flower + Status
  if (compact) {
    if (loading || error) return null; // keep header while loading/errored
    return (
      <div className="flex items-center gap-1 shrink-0"> {/* gap text,flower */}
        <div className="origin-center scale-[0.65]"> {/* scale flower */}
          <FlowerDisplay currentUnits={units} showMultiplier={false} />
        </div>
        <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
          <div>
          Units {units}/5 • {multiplier.toFixed(2)}x
          </div>
          <div className={`font-medium ${colorClass}`}>
            Status: {stateName}
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <span className="loading loading-spinner" />
        <span className="ml-2 text-sm opacity-70">Flower loading…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full text-center text-red-600 py-6">
        Unable to load flower data ({String(error)})
      </div>
    );
  }

}

