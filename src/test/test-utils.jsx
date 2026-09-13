import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import authReducer from '../store/slices/authSlice';
import appReducer from '../store/slices/appSlice';
import themeReducer from '../store/slices/themeSlice';
import languageReducer from '../store/slices/languageSlice';
import uiReducer from '../store/slices/uiSlice';

// Store Redux mới cho mỗi test, cùng shape reducer với src/store/store.js.
// Dùng preloadedState để set thẳng auth.isLogin/roles/... thay vì phải seed
// localStorage rồi phụ thuộc vào việc authSlice đọc localStorage lúc import module.
export function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      auth: authReducer,
      app: appReducer,
      theme: themeReducer,
      language: languageReducer,
      ui: uiReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

export function renderWithProviders(
  ui,
  { preloadedState, route = '/', initialEntries, store = createTestStore(preloadedState), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries || [route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
