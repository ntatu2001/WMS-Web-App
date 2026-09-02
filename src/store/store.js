import { configureStore } from '@reduxjs/toolkit';

// Import reducers từ các slices
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import themeReducer from './slices/themeSlice';
import languageReducer from './slices/languageSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    // Các reducers sẽ được thêm vào đây
    auth: authReducer,
    app: appReducer,
    theme: themeReducer,
    language: languageReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 