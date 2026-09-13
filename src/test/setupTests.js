import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom không cài sẵn window.matchMedia — uiSlice.js gọi nó ngay lúc import module
// (để tính sidebarCollapsed mặc định theo breakpoint) nên phải polyfill trước khi
// bất kỳ test nào import store/uiSlice, nếu không sẽ throw "not a function".
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// authSlice đọc localStorage ngay lúc import module — reset trước mỗi test để
// tránh state (refreshToken/isBootstrapping) rò rỉ giữa các test.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
