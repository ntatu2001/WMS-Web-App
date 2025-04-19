import "./App.css";
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GlobalStyle from "./common/GlobalStyle.jsx";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import LoadingPage from "./common/components/LoadingPage/LoadingPage";
import MainLayout from "./common/components/layout/MainLayout";

// Features
import LoginScreen from "./features/Login/LoginScreen.jsx";
import Dashboard from "./features/Dashboard/presentation/Dashboard.jsx";
import LoginGuard from "./features/LoginGuard/LoginGuard.jsx";
import GoodReceipt from "./features/GoodReceipt/presentation/GoodReceipt/GoodReceipt.jsx";
import GoodIssue from "./features/GoodIssue/presentation/GoodIssue/GoodIssue.jsx";
import History from "./features/History/presentation/History/History.jsx";
import Storage from "./features/Storage/presentation/Storage/Storage.jsx";
import Catalogue from "./features/Catalogue/presentation/Catalogue/Catalogue.jsx";

function App() {
  const isLoading = useSelector((state) => state.app.isLoading);
  const isLogin = useSelector((state) => state.auth.isLogin);

  useEffect(() => {
    console.log("App mounted");
    console.log("Current state - isLogin:", isLogin);
    console.log("Current state - isLoading:", isLoading);
  }, [isLogin, isLoading]);

  return (
    <div className="appContainer">
      <GlobalStyle />
      {isLoading && <LoadingPage />}
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isLogin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="loginContainer">
              <h1 className="loginTitle">Warehouse Management System</h1>
              <LoginScreen />
            </div>
          )
        } />

        {/* Protected routes */}
        <Route element={<LoginGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/storage" element={<Storage/>} />
            <Route path="/goodreceipt" element={<GoodReceipt />} />
            <Route path="/goodissue" element={<GoodIssue />} />
            <Route path="/inventory" element={<div>Kiểm kê</div>} />
            <Route path="/history" element={<History />} />
            <Route path="/catalogue" element={<Catalogue />} />
          </Route>
        </Route>

        {/* Default route */}
        <Route path="/" element={
          isLogin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
