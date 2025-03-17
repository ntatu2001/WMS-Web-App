import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogin: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLogin = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isLogin = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
