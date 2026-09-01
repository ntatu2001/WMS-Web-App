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

// Receipt / issue / inventory workflow status → { labelKey, color }.
// Resolve labelKey with useTranslation's t() at render time.
export const WORKFLOW_STATUS = {
  Pending: { labelKey: 'status.pending', color: STATUS_COLOR.neutral },
  InProgress: { labelKey: 'status.inProgress', color: STATUS_COLOR.info },
  Done: { labelKey: 'status.done', color: STATUS_COLOR.success },
  Cancelled: { labelKey: 'status.cancelled', color: STATUS_COLOR.error },
  HoldOn: { labelKey: 'status.holdOn', color: STATUS_COLOR.warning },
  IsBlocked: { labelKey: 'status.blocked', color: STATUS_COLOR.critical },
};

// react-spinners <ClipLoader> accent color (resolves fine as a CSS var string).
export const SPINNER_COLOR = 'var(--color-teal)';
export const SPINNER_ON_ACCENT = '#fff';
