import "./App.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import UpdateAccount from "./features/Setting/presentation/UpdateAccount/UpdateAccount.jsx";
import LotAdjustment from "./features/LotAdjustment/presentation/LotAdjustment/LotAdjustment.jsx";
import { AiOutlineUser, AiOutlineEdit, AiOutlineClose } from "react-icons/ai"; // Import appropriate icons

function App() {
  const isLoading = useSelector((state) => state.app.isLoading);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const [lastAccessedRoute, setLastAccessedRoute] = useState({
    mainContent: "/dashboard",
    sidebarContent: null,
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to control sidebar visibility
  const [activeContent, setActiveContent] = useState(null); // State to track active content
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/setting") {
      setLastAccessedRoute((prevRoute) => ({
        ...prevRoute,
        mainContent: location.pathname,
        sidebarContent: location.pathname,
      }));
    }
  }, [location]);

  const renderActiveContent = () => {
    if (activeContent === "account") {
      return <Account closeHandler={() => setActiveContent(null)} />; // Pass closeHandler to Account
    } else if (activeContent === "update") {
      return (
        <UpdateAccount
          onCancel={() => {
            setActiveContent(null); // Reset active content
            setIsSidebarVisible(true); // Ensure the sidebar remains visible
          }}
        />
      ); // Pass closeHandler to UpdateAccount
    } else if (activeContent === "logout") {
      return (
        <Logout
          onCancel={() => {
            setActiveContent(null); // Reset active content
            setIsSidebarVisible(true); // Ensure the sidebar remains visible
          }}
        />
      );
    }
    return null;
  };

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
            <Route path="/inventory" element={<LotAdjustment />} />
            <Route path="/history" element={<History />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route
              path="/setting/*"
              element={
                <div style={{ display: "flex", position: "relative" }}>
                  <div style={{ flex: 1, marginLeft: "0", height: "100%", overflow: "hidden", position: "relative" }}>
                    {lastAccessedRoute.sidebarContent === "/dashboard" ? (
                      <Dashboard />
                    ) : lastAccessedRoute.sidebarContent === "/storage" ? (
                      <Storage />
                    ) : lastAccessedRoute.sidebarContent === "/goodreceipt" ? (
                      <GoodReceipt />
                    ) : lastAccessedRoute.sidebarContent === "/goodissue" ? (
                      <GoodIssue />
                    ) : lastAccessedRoute.sidebarContent === "/inventory" ? (
                      <LotAdjustment />
                    ) : lastAccessedRoute.sidebarContent === "/history" ? (
                      <History />
                    ) : lastAccessedRoute.sidebarContent === "/catalogue" ? (
                      <Catalogue />
                    ) : null}
                    <div
                      className="settingContainer"
                      style={{
                        position: "fixed",
                        top: "0",
                        right: "0",
                        width: "calc(100vw * 0.8952)",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        zIndex: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event propagation
                        setIsSidebarVisible(true); // Ensure the dropdownMenu is always visible
                        if (typeof modalContent === "function") {
                          modalContent(); // Execute modalContent logic if defined
                          return;
                        }
                        navigate(lastAccessedRoute.mainContent); // Navigate back to the previously accessed path
                      }}
                    >
                      {isSidebarVisible && (
                        <div
                          className="dropdownMenu"
                          style={{
                            position: "fixed",
                            top: "546.4px",
                            left: "200px", // Adjusted to match the width of the sidebarSetting
                            width: "200px",
                            backgroundColor: "#002B49", // Match the background color as shown in the image
                            boxShadow: "0 4px 8px rgb(0, 31, 47)",
                            zIndex: 2,
                          }}
                        >
                          {/* Dropdown menu content */}
                          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            <li
                              className="AccountSetting"
                              style={{
                                height: "60px",
                                width: "200px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                fontSize: "20px",
                                fontWeight: "700",
                                color: activeContent === "account" ? "#002B49" : "#FFFFFF", // Keep color if active
                                backgroundColor: activeContent === "account" ? "#FFFFFF" : "#002B49", // Keep background if active
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (activeContent !== "account") {
                                  e.target.style.backgroundColor = "#FFFFFF";
                                  e.target.style.color = "#000000";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (activeContent !== "account") {
                                  e.target.style.backgroundColor = "#002B49";
                                  e.target.style.color = "#FFFFFF";
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveContent("account");
                                document.body.style.backgroundColor = "#FFFFFF";
                                document.body.style.color = "#002B49";
                              }}
                            >
                              <AiOutlineUser style={{ marginRight: "8px", fontSize: "24px" }} /> Tài khoản
                            </li>
                            <li
                              className="UpdateAccount"
                              style={{
                                height: "60px",
                                width: "200px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                fontSize: "20px",
                                fontWeight: "700",
                                color: activeContent === "update" ? "#002B49" : "#FFFFFF", // Keep color if active
                                backgroundColor: activeContent === "update" ? "#FFFFFF" : "#002B49", // Keep background if active
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (activeContent !== "update") {
                                  e.target.style.backgroundColor = "#FFFFFF";
                                  e.target.style.color = "#000000";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (activeContent !== "update") {
                                  e.target.style.backgroundColor = "#002B49";
                                  e.target.style.color = "#FFFFFF";
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveContent("update");
                                document.body.style.backgroundColor = "#FFFFFF";
                                document.body.style.color = "#002B49";
                              }}
                            >
                              <AiOutlineEdit style={{ marginRight: "8px", fontSize: "24px" }} /> Cập nhật
                            </li>
                            <li
                              style={{
                                height: "60px", // Total height including padding
                                width: "200px", // Width to accommodate text and padding
                                padding: "16px", // Padding around the text
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start", // Align text to the left
                                cursor: "pointer",
                                boxSizing: "border-box", // Ensure padding is included in the dimensions
                                fontSize: "20px", // Font size for the text
                                fontWeight: "700",
                                color: "#FFFFFF", // Default white text color
                                backgroundColor: "#002B49", // Default background color
                                transition: "all 0.3s ease", // Smooth transition for hover effects
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#FFFFFF"; // Change background to white
                                e.target.style.color = "#FF4D4F"; // Change text and icon to red
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#002B49"; // Revert background to default
                                e.target.style.color = "#FFFFFF"; // Revert text and icon to default
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event propagation
                                setActiveContent("logout"); // Set active content to "logout"
                              }}
                            >
                              <AiOutlineClose
                                style={{
                                  marginRight: "8px",
                                  fontSize: "24px",
                                  color: "inherit", // Inherit color from parent element
                                }}
                              /> Đăng xuất
                            </li>
                          </ul>
                        </div>
                      )}
                      {activeContent && (
                        <div
                          className="modalContent"
                          style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            zIndex: 4, // Ensure it appears above settingContainer
                            backgroundColor: "#fff",
                            padding: "20px",
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent clicks inside modalContent from propagating
                        >
                          {renderActiveContent()}
                        </div>
                      )}
                      <div
                        
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modalContent from triggering settingContainer's onClick
                      >
                        <Routes>
                          <Route path="/" element={<Setting onCancel={() => setIsSidebarVisible(true)} />} />
                          <Route path="account" element={<Account />} />
                          <Route path="logout" element={<Logout />} />
                          <Route
                            path="update"
                            element={
                              <div
                                className="modalContent"
                                style={{
                                  position: "relative",
                                  margin: "auto",
                                  
                                  borderRadius: "8px",
                                  width: "50%",
                                  zIndex: 2,
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modalContent from triggering settingContainer's onClick
                              >
                                <UpdateAccount
                                  onCancel={() => {
                                    setIsSidebarVisible(true); // Ensure the sidebar remains visible
                                    navigate("/setting"); // Navigate back to the setting page
                                  }}
                                />
                              </div>
                            }
                          />
                        </Routes>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
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
