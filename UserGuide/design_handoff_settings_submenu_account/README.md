# Handoff: Sidebar Settings Flyout + Account Management Redesign

## Overview
Redesign of two parts of an existing WMS (Warehouse Management System) web app:
1. The left sidebar navigation, specifically the "Cài đặt" (Settings) flyout submenu.
2. The "Quản lý tài khoản" (Account Management) panel, moved from a single long column to a two-column layout.

## About the Design Files
The file in this bundle (`WMS Redesign.dc.html`) is a **design reference built in HTML** — a prototype showing intended look, layout, and interaction, not production code to copy verbatim. Recreate this design in the target app's existing environment (its actual frontend framework, component library, and state-management patterns), matching the visuals and behavior described below. Do not just paste the HTML into the app.

## Fidelity
**High-fidelity.** Colors, spacing, typography, and radii below are final values from the mock and should be matched precisely. Icons are inline SVG placeholders (Feather/Lucide-style outline icons) — swap for the codebase's existing icon set if it has equivalent icons, otherwise use these paths as reference.

## Screens / Views

### 1. Sidebar — Settings flyout
**Purpose:** Existing sidebar nav item "Cài đặt" expands a flyout with account-related actions, replacing the old cramped/unaligned submenu.

**Layout:**
- Sidebar: fixed width 260px, full height, background `#0a1830` (top) blending to a nav area with `linear-gradient(180deg, #0e3a45, #0c2f3a)`.
- Nav items: vertical stack, `gap: 2px`, each item `padding: 12px 14px`, `border-radius: 10px`, icon (19x19 SVG) + label, `font-size: 15px`, `font-weight: 600–700`.
- Active nav item ("Tổng quan" in mock): background `rgba(45,212,191,0.16)`, `font-weight: 700`.
- "Cài đặt" row pinned near the bottom, above it a `1px solid rgba(255,255,255,0.1)` divider with `padding-top: 10px`.
- "Cài đặt" row: same padding/radius as other items, includes a trailing chevron icon (15x15) that rotates 90° (`transition: transform 0.18s`) when the flyout is open; row background becomes `rgba(255,255,255,0.1)` when open.
- **Flyout panel**: absolutely positioned at `left: calc(100% + 10px)`, `bottom: 0` relative to the Cài đặt row (opens to the right of the sidebar, bottom-aligned). Width 232px, background `#0a1830`, `1px solid rgba(255,255,255,0.1)` border, `border-radius: 14px`, `box-shadow: 0 20px 45px rgba(0,0,0,0.45)`, `padding: 8px`.
- A small rotated square (14x14, `rotate(45deg)`) positioned at `left: -7px`, `bottom: 20px` forms a pointer/tail connecting the flyout to the trigger row, same background/border as the panel.
- Flyout contents, top to bottom:
  - Section label "Tài khoản" — `font-size: 11px`, `font-weight: 700`, `letter-spacing: 0.06em`, uppercase, color `rgba(255,255,255,0.4)`, `padding: 5px 8px 8px`.
  - "Tạo tài khoản mới" row — icon (user-plus) + label, `font-size: 14.5px`, `font-weight: 600`, white text, `padding: 11px 12px`, `border-radius: 9px`; hover background `rgba(45,212,191,0.14)`.
  - "Quản lý tài khoản" row — icon (user-circle) + label, same sizing; this one has a persistent highlighted background `rgba(45,212,191,0.16)` (since it's the primary/current action) and hover `rgba(45,212,191,0.24)`. Clicking opens the Account Management panel (see screen 2).
  - Divider: `1px solid rgba(255,255,255,0.1)`, `margin: 7px 4px`.
  - "Đăng xuất" (Log out) row — icon (log-out) + label in warning red `#f87171`, hover background `rgba(248,113,113,0.12)`.
- Entrance animation: `fadeIn` keyframes — opacity 0→1 with `translateY(-4px)→0`, duration 0.15s ease-out.

**Interaction:** Clicking the "Cài đặt" row toggles `settingsOpen` state, showing/hiding the flyout and rotating the chevron. Clicking outside should close it (implement click-outside handling in the real app; the mock only toggles on the row itself).

### 2. Account Management panel
**Purpose:** Form to create a new account (the backend currently only supports account creation, not listing existing accounts).

**Layout:**
- Slide-in panel from the right, width 820px, full height, white background, `box-shadow: -8px 0 30px rgba(0,0,0,0.12)`, flex column: header / scrollable body / footer.
- **Header**: `padding: 26px 36px`, bottom border `1px solid oklch(0.92 0.005 250)`, flex row space-between. Title "Quản lý tài khoản" — `font-size: 23px`, `font-weight: 800`, color `#0e2a3a`. Close (×) button top-right, 34x34px, `border-radius: 9px`, hover background `oklch(0.94 0.005 250)`.
- **Body**: `padding: 28px 36px`, scrollable.
  - Info banner at top: light teal background `oklch(0.965 0.02 200)`, border `1px solid oklch(0.9 0.03 200)`, `border-radius: 12px`, `padding: 14px 16px`, info icon (`#1a6f7a`) + explanatory text (13.5px, color `#245a63`) noting only Admins can create accounts and there's no account list yet (API limitation).
  - Below the banner: **two-column grid**, `grid-template-columns: 1fr 1fr`, `gap: 36px`.
    - **Left column — "Thông tin đăng nhập" (Login info)**: section heading (15px, 800 weight, `#0e2a3a`, bottom border `2px solid oklch(0.92 0.005 250)`, `padding-bottom: 10px`, `margin-bottom: 16px`).
      - Avatar upload: 64x64 circular placeholder with diagonal-stripe pattern background, camera icon, border `1px solid oklch(0.88 0.005 250)` that highlights teal on hover; label "Ảnh đại diện" + helper text "kéo & thả ảnh · JPG/PNG" in monospace, 12px, `#8a8f98`.
      - Text inputs (Tên đăng nhập / Username, Email, Mật khẩu / Password): full width, `padding: 12px 14px`, `border-radius: 9px`, `border: 1.5px solid oklch(0.88 0.005 250)`, `font-size: 14.5px`, label above each (13.5px, 700 weight, `#374151`), focus border color `#2dd4bf`, `margin-bottom: 18px` between fields.
    - **Right column — "Phân quyền" (Permissions)**: same heading style.
      - Role selector: 3 selectable cards (Admin / Manager / Staff), each a row with icon tile (38x38, rounded 9px), label (14.5px, 700, `#0e2a3a`) + description (12.5px, `#8a8f98`), and a radio-style dot (20x20 circle) on the right. Selected card: border `#2dd4bf`, background `oklch(0.97 0.02 200)`, icon tile filled teal with white icon; unselected: neutral gray border/background. Icons: Admin = star/badge, Manager = user-check, Staff = user. Descriptions: Admin "Toàn quyền hệ thống", Manager "Quản lý kho & nhân viên", Staff "Thao tác nhập/xuất kho". Default selected role in mock: Manager.
      - Below: "Liên kết nhân viên" (Link to employee) — a select dropdown, same input styling as text fields, default option "Không liên kết".
- **Footer**: `padding: 20px 36px`, top border `1px solid oklch(0.92 0.005 250)`, flex row, right-aligned, `gap: 12px`.
  - "Huỷ" (Cancel) button — neutral gray background `oklch(0.94 0.005 250)`, `#374151` text, hover darkens to `oklch(0.9 0.005 250)`.
  - "Tạo tài khoản" (Create account) primary button — gradient background `linear-gradient(135deg, #2dd4bf, #1a8f8f)`, white text, `box-shadow: 0 6px 16px rgba(45,212,191,0.35)`, hover `filter: brightness(1.06)`. Both buttons: `padding: 11px 22–24px`, `border-radius: 9px`, `font-weight: 700`, `font-size: 14.5px`.

**Interaction:** Panel open/close state (`accountModalOpen`). Role cards are single-select (`selectedRole` state) — clicking a card selects it and updates the highlighted style. Real implementation should call the account-creation API on submit and validate required fields (username, email, password, role) before enabling "Tạo tài khoản".

## State Management
- `settingsOpen: boolean` — controls sidebar flyout visibility.
- `accountModalOpen: boolean` — controls account panel visibility.
- `selectedRole: 'Admin' | 'Manager' | 'Staff'` — selected role in the create-account form.
- Form fields (username, email, password, avatar file, linked employee) — not yet wired to state in the mock; add real form state + validation + submit handler in the actual implementation.

## Design Tokens
**Colors**
- Sidebar background: `#0a1830` → nav gradient `#0e3a45` to `#0c2f3a`
- Primary accent (teal/cyan): `#2dd4bf`, darker teal `#1a6f7a` / `#1a8f8f`
- Active/highlight tint: `rgba(45,212,191,0.16)`
- Text on dark: white / `rgba(255,255,255,0.85)` / `rgba(255,255,255,0.4)` (muted labels)
- Danger (logout): `#f87171`, hover tint `rgba(248,113,113,0.12)`
- Panel text: heading `#0e2a3a`, body/label `#374151`, muted `#8a8f98`
- Neutral grays (borders/backgrounds): `oklch(0.88–0.965 0.005–0.03 200–250)` range — see inline styles for exact values per element
- Info banner: background `oklch(0.965 0.02 200)`, border `oklch(0.9 0.03 200)`, text `#245a63`

**Typography**
- Font stack: `-apple-system, "Segoe UI", Helvetica, Arial, sans-serif`
- Sizes used: 23px (panel title, 800 weight), 19px (logo text, 800), 15px (nav items/section headings, 700–800), 14.5px (buttons, inputs, role labels, 600–700), 13.5px (form labels, banner text, 700/400), 12.5–12px (helper/description text), 11px (uppercase section label)

**Spacing / Radius**
- Sidebar item radius: 10px; flyout panel radius: 14px; flyout item radius: 9px
- Inputs/buttons radius: 9px; role cards radius: 11px; icon tiles radius: 9px
- Panel padding: 26–36px depending on section; flyout padding: 8px; grid gap between columns: 36px

**Shadows**
- Flyout panel: `0 20px 45px rgba(0,0,0,0.45)`
- Account panel (slide-in): `-8px 0 30px rgba(0,0,0,0.12)`
- Primary button: `0 6px 16px rgba(45,212,191,0.35)`

## Assets
No external image assets — all icons are inline outline-style SVGs (stroke-based, 2px stroke width, sizes 15–22px) drawn directly in the mock. Replace with the codebase's existing icon set if available (Lucide/Feather-compatible paths were used as reference). Avatar upload placeholder is a CSS-drawn diagonal stripe pattern, not an image asset.

## Files
- `WMS Redesign.dc.html` — full interactive HTML/JS prototype containing both the sidebar flyout and the account management panel, with working toggle/select state (open in a browser to see live behavior).
