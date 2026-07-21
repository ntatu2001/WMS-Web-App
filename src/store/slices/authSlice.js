import { createSlice } from '@reduxjs/toolkit';

const storedRefreshToken = localStorage.getItem('refreshToken');

const initialState = {
  isLogin: false,
  accessToken: null,
  refreshToken: storedRefreshToken,
  roles: [],
  userName: null,
  // Nếu có refreshToken cũ trong localStorage, LoginGuard sẽ thử refresh ngầm trước khi quyết định điều hướng /login
  isBootstrapping: !!storedRefreshToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { accessToken, refreshToken, roles, userName } = action.payload;
      state.isLogin = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.roles = roles || [];
      state.userName = userName;
      state.isBootstrapping = false;
      localStorage.setItem('refreshToken', refreshToken);
    },
    tokensRefreshed: (state, action) => {
      const { accessToken, refreshToken, roles } = action.payload;
      state.isLogin = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      if (roles) {
        state.roles = roles;
      }
      state.isBootstrapping = false;
      localStorage.setItem('refreshToken', refreshToken);
    },
    bootstrapFailed: (state) => {
      state.isBootstrapping = false;
    },
    logout: (state) => {
      state.isLogin = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.roles = [];
      state.userName = null;
      state.isBootstrapping = false;
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { loginSuccess, tokensRefreshed, bootstrapFailed, logout } = authSlice.actions;

export default authSlice.reducer;
