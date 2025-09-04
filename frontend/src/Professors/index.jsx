import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProfessorChecking from './Components/Waiting';

function Professors() {
    const credential = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    
    useEffect (() => {
        if(!credential.role === "teacher") return navigate("/");
    }, [credential]);

    if ( credential.role === "teacher")
        return (
            <Routes>
                <Route path="/" element={<ProfessorChecking/>}/>
            </Routes>
        );

    return <></>;
}

export default Professors;