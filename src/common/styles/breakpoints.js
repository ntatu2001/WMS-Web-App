// Breakpoint values shared by JS (useMediaQuery/useBreakpoint) and mirrored in
// `_breakpoints.scss` for SCSS mixins. SCSS cannot import JS (and vice versa),
// so the two files intentionally duplicate these numbers — keep them in sync
// by hand; this app is small enough that a codegen step isn't worth it.
export const BP_MOBILE = 375; // min supported width — usable, not pixel-perfect
export const BP_SM = 640; // mobile landscape / small tablet
export const BP_TABLET = 768; // primary tablet target (portrait iPad / warehouse tablet)
export const BP_DESKTOP = 1024; // sidebar returns to permanent/expanded, multi-column layouts resume
