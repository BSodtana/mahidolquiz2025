import React, { useState } from "react";
import FlowerDisplay from "./FlowerDisplay";
import { MIN_UNITS, MAX_UNITS } from "./flowerHelpers";
export default function FlowerSandbox() {
  const [units, setUnits] = useState(5); // เริ่มจาก 5/5
  // ลดค่าหน่วย 1 ขั้น แต่ไม่ต่ำกว่า MIN_UNITS
  const dec = () => setUnits((u) => Math.max(MIN_UNITS, u - 1));
  // เพิ่มค่าหน่วย 1 ขั้น แต่ไม่เกิน MAX_UNITS
  const inc = () => setUnits((u) => Math.max(Math.min(MAX_UNITS, u + 1), MIN_UNITS));
  const reset = () => setUnits(5);
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-3">Flower Sandbox</h1>
      <FlowerDisplay currentUnits={units} isCurrentTeam showMultiplier />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="btn btn-outline" onClick={dec}>-1</button>
        <button className="btn btn-outline" onClick={reset}>reset 5/5</button>
        <button className="btn btn-outline" onClick={inc}>+1</button>
      </div>
      <p className="mt-3 text-sm opacity-75">
        ปัจจุบัน: {units}/5 (min {MIN_UNITS}, max {MAX_UNITS})
      </p>
      <p className="text-xs opacity-60">
        test UI ก่อนต่อ backend 
      </p>
    </div>
  );
}
