import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import LoginPage from "./components/LoginPage";
import LoginRedirect from "./components/LoginRedirect";
 
import Dashboard from "./components/Dashboard";
import "./static/css/style.css";
import { useAuth } from "~hooks/useAuth";

const AppRoutes = () => {
  const { user } = useAuth();
  useEffect(() => {
    console.log("Popup loaded");
    return () => {
    };
  }, []);
  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Navigate to={'/login'}/> } />
      <Route path="/login" element={user ? <Navigate to={'/'}/> : <LoginRedirect />} />
    </Routes>
  );
};

const Popup = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default Popup;
