import { createSlice } from '@reduxjs/toolkit';
import { BP_DESKTOP } from '../../common/styles/breakpoints';

// App-shell UI state shared between Sidebar and MainLayout (they aren't in
// the same subtree via <Outlet/>, so this lives in Redux like theme/language).
// - sidebarCollapsed: desktop/tablet icon-rail toggle, persisted (mirrors themeSlice.js).
//   No stored preference yet → default collapsed on tablet widths (< 1024px), expanded on
//   desktop, so first-time tablet users land on the icon-rail without losing the ability
//   to expand it (the toggle button always works and persists from then on).
// - isMobileNavOpen: mobile off-canvas drawer, NOT persisted — always closed on load/navigation.
const stored = localStorage.getItem('sidebarCollapsed');
const defaultCollapsed =
  typeof window !== 'undefined' && window.matchMedia(`(max-width: ${BP_DESKTOP - 1}px)`).matches;

const initialState = {
  sidebarCollapsed: stored === null ? defaultCollapsed : stored === 'true',
  isMobileNavOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = !!action.payload;
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
    },
    openMobileNav: (state) => {
      state.isMobileNavOpen = true;
    },
    closeMobileNav: (state) => {
      state.isMobileNavOpen = false;
    },
    toggleMobileNav: (state) => {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
  },
});

export const {
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openMobileNav,
  closeMobileNav,
  toggleMobileNav,
} = uiSlice.actions;
export default uiSlice.reducer;
