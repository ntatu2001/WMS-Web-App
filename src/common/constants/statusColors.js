// Shared, theme-aware status colors. Values are CSS custom properties defined in
// src/common/styles/tokens.css, so they adapt automatically to light/dark.
// Safe to use directly in inline style objects (the browser resolves the var).

export const STATUS_COLOR = {
  neutral: 'var(--status-neutral)',
  info: 'var(--status-info)',
  success: 'var(--status-success)',
  error: 'var(--status-error)',
  warning: 'var(--status-warning)',
  critical: 'var(--status-critical)',
  pending: 'var(--status-pending)',
};

// Receipt / issue / inventory workflow status → { label, color }
export const WORKFLOW_STATUS = {
  Pending: { label: 'Chờ xử lý', color: STATUS_COLOR.neutral },
  InProgress: { label: 'Đang thực hiện', color: STATUS_COLOR.info },
  Done: { label: 'Hoàn thành', color: STATUS_COLOR.success },
  Cancelled: { label: 'Đã hủy', color: STATUS_COLOR.error },
  HoldOn: { label: 'Tạm hoãn', color: STATUS_COLOR.warning },
  IsBlocked: { label: 'Bị chặn', color: STATUS_COLOR.critical },
};

// react-spinners <ClipLoader> accent color (resolves fine as a CSS var string).
export const SPINNER_COLOR = 'var(--color-teal)';
export const SPINNER_ON_ACCENT = '#fff';
