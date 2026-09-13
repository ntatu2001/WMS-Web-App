import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// authSlice đọc localStorage ngay lúc import module — reset trước mỗi test để
// tránh state (refreshToken/isBootstrapping) rò rỉ giữa các test.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
