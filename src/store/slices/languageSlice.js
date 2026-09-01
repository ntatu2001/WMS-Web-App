import { createSlice } from '@reduxjs/toolkit';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '../../common/i18n';

// Persisted UI preference — mirrors the localStorage pattern used in themeSlice.js / authSlice.js.
const stored = localStorage.getItem('lang');

const initialState = {
  lang: SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      const next = SUPPORTED_LANGS.includes(action.payload) ? action.payload : DEFAULT_LANG;
      state.lang = next;
      localStorage.setItem('lang', next);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
