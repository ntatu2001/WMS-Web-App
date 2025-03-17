import { configureStore } from '@reduxjs/toolkit';

// Import reducers từ các slices
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';

const store = configureStore({
  reducer: {
    // Các reducers sẽ được thêm vào đây
    auth: authReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 