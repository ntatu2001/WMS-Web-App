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


function App() {
  const isLoading = useSelector((state) => state.app.isLoading);
  const isLogin = useSelector((state) => state.auth.isLogin);

  useEffect(() => {
    console.log("App mounted");
    console.log("Current state - isLogin:", isLogin);
    console.log("Current state - isLoading:", isLoading);
  }, [isLogin, isLoading]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <GlobalStyle />
      {isLoading && <LoadingPage />}
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isLogin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="p-5 max-w-2xl mx-auto bg-white rounded-lg shadow-md mt-12">
              <h1 className="text-center text-[#333] mb-5 font-bold text-2xl">Warehouse Management System</h1>
              <LoginScreen />
            </div>
          )
        } />

        {/* Protected routes */}
        <Route element={<LoginGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/storage" element={<div>Lưu trữ</div>} />
            <Route path="/goodreceipt" element={<GoodReceipt />} />
            <Route path="/goodissue" element={<div>Xuất kho</div>} />
            <Route path="/inventory" element={<div>Kiểm kê</div>} />
            <Route path="/history" element={<div>Lịch sử</div>} />
            <Route path="/catalogue" element={<div>Danh mục</div>} />
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
