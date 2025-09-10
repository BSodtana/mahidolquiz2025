import React, { } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRouter from "./Admin";
import Competition from './Competition';
import './css/App.css'
import 'animate.css';
import LoginPage from "./Login";
import Professors from "./Professors";
import StreamerRoutes from "./Streamer";
//ทดสอบ
import FlowerSandbox from "./Competition/Components/FlowerDisplay/FlowerSandbox";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/competition" element={<Competition />} />
        <Route path="/professor/*" element={<Professors />} />
        <Route path="/streamer/*" element={<StreamerRoutes />} />
        <Route path="/admin/*" element={<AdminRouter />} />
        {/* ... ทดสอบ */}
        <Route path="/FlowerSandbox" element={<FlowerSandbox />} />
      </Routes>

    </div>
  )
}

export default App
