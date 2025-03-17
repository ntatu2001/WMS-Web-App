import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: null,
  // Thêm các trạng thái khác của ứng dụng tại đây
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Thêm các reducers khác tại đây
  },
});

export const { setLoading, setError, clearError } = appSlice.actions;

export default appSlice.reducer; 