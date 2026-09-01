import { createSlice } from '@reduxjs/toolkit';

// Persisted UI preference — mirrors the localStorage pattern used in authSlice.js.
// mode: 'light' | 'dark' | 'system'  (default 'system' → follows the OS setting)
const VALID_MODES = ['light', 'dark', 'system'];
const stored = localStorage.getItem('themeMode');

const initialState = {
  mode: VALID_MODES.includes(stored) ? stored : 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      const next = VALID_MODES.includes(action.payload) ? action.payload : 'system';
      state.mode = next;
      localStorage.setItem('themeMode', next);
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
