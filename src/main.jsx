import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import './common/styles/tokens.css';
import './common/styles/react-datepicker-dark.css';
import App from './App.jsx';
import store from './store/store';

// Use HashRouter for production to avoid server routing issues. VITE_ROUTER_MODE cho
// phép ép kiểu router bất kể PROD/DEV — dùng khi E2E cần chạy trên production build
// (không có StrictMode double-invoke effect) nhưng vẫn muốn URL sạch (BrowserRouter)
// để dễ assert; không set biến này thì hành vi mặc định giữ nguyên như cũ.
const routerMode = import.meta.env.VITE_ROUTER_MODE || (import.meta.env.PROD ? 'hash' : 'browser');
const Router = routerMode === 'hash' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
);
