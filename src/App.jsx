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
import RequireRole from "./features/RequireRole/RequireRole.jsx";
import Forbidden from "./features/Forbidden/Forbidden.jsx";
import GoodReceipt from "./features/GoodReceipt/presentation/GoodReceipt/GoodReceipt.jsx";
import GoodIssue from "./features/GoodIssue/presentation/GoodIssue/GoodIssue.jsx";
import History from "./features/History/presentation/History/History.jsx";
import Storage from "./features/Storage/presentation/Storage/Storage.jsx";
import Catalogue from "./features/Catalogue/presentation/Catalogue/Catalogue.jsx";
import Logout from "./features/Setting/presentation/Logout/Logout.jsx";
import Setting from "./features/Setting/presentation/Setting/Setting.jsx";
import FeatureUnavailable from "./features/Setting/presentation/FeatureUnavailable/FeatureUnavailable.jsx";
import UserManagement from "./features/Setting/presentation/UserManagement/UserManagement.jsx";
import Account from "./features/Setting/presentation/Account/Account.jsx";
import Appearance from "./features/Setting/presentation/Appearance/Appearance.jsx";
import LotAdjustment from "./features/LotAdjustment/presentation/LotAdjustment/LotAdjustment.jsx";
import { getDefaultRouteForRoles } from "./common/config/menuConfig.js";
import useApplyTheme, { useResolvedTheme } from "./common/hooks/useApplyTheme.js";
import useApplyLanguage from "./common/hooks/useApplyLanguage.js";

// Backdrop mờ, căn giữa cho các trang con của "Cài đặt" chưa tự lo vị trí hiển thị (Logout, FeatureUnavailable)
const centeredPanelBackdropStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  boxSizing: "border-box",
  backgroundColor: "var(--color-overlay)",
  zIndex: 5,
};

function App() {
  useApplyTheme();
  useApplyLanguage();
  const resolvedTheme = useResolvedTheme();
  const isLoading = useSelector((state) => state.app.isLoading);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const roles = useSelector((state) => state.auth.roles);
  const [lastAccessedRoute, setLastAccessedRoute] = useState(() => ({
    mainContent: getDefaultRouteForRoles(roles),
    sidebarContent: null,
  }));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.pathname.startsWith("/setting")) {
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
      <ToastContainer theme={resolvedTheme} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isLogin ? (
              <Navigate to={getDefaultRouteForRoles(roles)} replace />
            ) : (


                <LoginScreen />

            )
          }
        />

        <Route path="/403" element={<Forbidden />} />

        {/* Protected routes */}
        <Route element={<LoginGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<RequireRole roles={["Admin"]}><Dashboard /></RequireRole>} />
            <Route path="/storage" element={<RequireRole roles={["Manager", "Admin"]}><Storage /></RequireRole>} />
            <Route path="/goodreceipt" element={<GoodReceipt />} />
            <Route path="/goodissue" element={<GoodIssue />} />
            <Route path="/inventory" element={<LotAdjustment />} />
            <Route path="/history" element={<RequireRole roles={["Manager", "Admin"]}><History /></RequireRole>} />
            <Route path="/catalogue" element={<RequireRole roles={["Manager", "Admin"]}><Catalogue /></RequireRole>} />
            <Route
              path="/setting/*"
              element={
                <div style={{ position: "relative", height: "100%" }}>
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

                  <Routes>
                    <Route path="/" element={<Setting />} />
                    <Route
                      path="account"
                      element={
                        <Account onCancel={() => navigate(lastAccessedRoute.mainContent)} />
                      }
                    />
                    <Route
                      path="logout"
                      element={
                        <div
                          style={centeredPanelBackdropStyle}
                          onClick={() => navigate(lastAccessedRoute.mainContent)}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <Logout />
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="update"
                      element={
                        <div
                          style={centeredPanelBackdropStyle}
                          onClick={() => navigate(lastAccessedRoute.mainContent)}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <FeatureUnavailable />
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <RequireRole roles={["Admin"]}>
                          <UserManagement onCancel={() => navigate(lastAccessedRoute.mainContent)} />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="appearance"
                      element={
                        <Appearance onCancel={() => navigate(lastAccessedRoute.mainContent)} />
                      }
                    />
                  </Routes>
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
              <Navigate to={getDefaultRouteForRoles(roles)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback route - ensure this works for server deployments */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
