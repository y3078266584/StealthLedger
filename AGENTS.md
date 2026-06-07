# StealthLedger (影记) — Agent Guidelines

## Project
React 19 SPA + Vite 8 + Tailwind CSS 4 → Android APK via Capacitor 8.
Auto-captures payments via AccessibilityService / NotificationListener.

## Commands
- `npm run dev` — web dev server
- `npm run build` — Vite build → dist/
- `npm run build-apk` — one-shot APK build (auto-increments version)
- `npm run lint` — ESLint

## Architecture
- `src/App.jsx` — single-page shell, tab navigation
- `src/hooks/useData.js` — useTransactions, useCategories, useBudgets
- `src/services/db.js` — IndexedDB layer (stores: transactions, categories, budgets, settings)
- `src/services/autoBilling.ts` — Capacitor plugin bridge to Android native
- `src/utils/parser.js` — payment-text + CSV parser
- `src/constants/categories.js` — merchant-name to category keyword matching
- `android/` — AccessibilityService, ForegroundService, NotificationListener, ClipboardMonitor

## Data Flow
Android native captures → Capacitor plugin → App.jsx polls every 5s → matches CATEGORY_KEYWORDS → db.add('transactions', ...)

## Rules
- Never write IndexedDB directly; use helpers from `src/services/db.js`
- After Android native changes: `npx cap sync android`
- Version in `android/app/build.gradle` + `package.json`; build script syncs both
- Components in `src/components/`; shared state via hooks in `src/hooks/`
- Prefer Tailwind utilities; avoid custom CSS
