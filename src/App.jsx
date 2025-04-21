import "./App.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GlobalStyle from "./common/GlobalStyle.jsx";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingPage from "./common/components/LoadingPage/LoadingPage";
import MainLayout from "./common/components/layout/MainLayout";
import LoginScreen from "./features/Login/LoginScreen.jsx";
import Dashboard from "./features/Dashboard/presentation/Dashboard.jsx";
import LoginGuard from "./features/LoginGuard/LoginGuard.jsx";
import GoodReceipt from "./features/GoodReceipt/presentation/GoodReceipt/GoodReceipt.jsx";
import GoodIssue from "./features/GoodIssue/presentation/GoodIssue/GoodIssue.jsx";
import History from "./features/History/presentation/History/History.jsx";
import Storage from "./features/Storage/presentation/Storage/Storage.jsx";
import Catalogue from "./features/Catalogue/presentation/Catalogue/Catalogue.jsx";
import Account from "./features/Setting/presentation/Account/Account.jsx";
import Logout from "./features/Setting/presentation/Logout/Logout.jsx";
import Setting from "./features/Setting/presentation/Setting/Setting.jsx";

function App() {
  const isLoading = useSelector((state) => state.app.isLoading);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const [lastAccessedRoute, setLastAccessedRoute] = useState({
    mainContent: "/dashboard",
    sidebarContent: null,
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to control sidebar visibility
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/setting") {
      setLastAccessedRoute((prevRoute) => ({
        ...prevRoute,
        mainContent: location.pathname,
        sidebarContent: location.pathname,
      }));
    }
  }, [location]);

  return (
    <div className="appContainer">
      <GlobalStyle />
      {isLoading && <LoadingPage />}
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isLogin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="loginContainer">
                <h1 className="loginTitle">Warehouse Management System</h1>
                <LoginScreen />
              </div>
            )
          }
        />

        {/* Protected routes */}
        <Route element={<LoginGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/goodreceipt" element={<GoodReceipt />} />
            <Route path="/goodissue" element={<GoodIssue />} />
            <Route path="/inventory" element={<div>Kiểm kê</div>} />
            <Route path="/history" element={<History />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route
              path="/setting"
              element={
                <div style={{ display: "flex", position: "relative" }}>
                  <div style={{ flex: 1, marginLeft: "0", height: "100vh", overflow: "hidden", position: "relative" }}>
                    {lastAccessedRoute.sidebarContent === "/dashboard" ? (
                      <Dashboard />
                    ) : lastAccessedRoute.sidebarContent === "/storage" ? (
                      <Storage />
                    ) : lastAccessedRoute.sidebarContent === "/goodreceipt" ? (
                      <GoodReceipt />
                    ) : lastAccessedRoute.sidebarContent === "/goodissue" ? (
                      <GoodIssue />
                    ) : lastAccessedRoute.sidebarContent === "/inventory" ? (
                      <div>Kiểm kê</div>
                    ) : lastAccessedRoute.sidebarContent === "/history" ? (
                      <History />
                    ) : lastAccessedRoute.sidebarContent === "/catalogue" ? (
                      <Catalogue />
                    ) : null}
                    {isSidebarVisible && ( // Conditionally render the sidebarContainer
                      <div
                        className="sidebarContainer"
                        style={{
                          position: "fixed",
                          top: "0",
                          right: "0",
                          width: "89.52%",
                          height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.2)",
                          zIndex: 1,
                        }}
                      >
                        <Setting
                          onCancel={() => {
                            setIsSidebarVisible(true); // Ensure the sidebarContainer remains visible
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              }
            />
            <Route path="/setting/account" element={<Account />} />
            <Route path="/setting/logout" element={<Logout />} />
          </Route>
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            isLogin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
