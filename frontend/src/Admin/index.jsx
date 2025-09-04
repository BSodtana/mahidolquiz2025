import React, {useEffect} from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AdminMainPage from "./Components/AdminMainPage";
function AdminRouter() {
  const credential = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  useEffect(() => {
    if (!credential.role === "admin") return navigate("/");
  }, [credential]);

  if (credential.role === "admin")
    return (
      <div className="m-2">
        <Routes>
          <Route path="/" element={<AdminMainPage />} />
        </Routes>
      </div>
    );

  return <></>;
}
export default AdminRouter;
