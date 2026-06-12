# StealthLedger (影记) — Agent Guidelines

## Project
React 19 SPA + Vite 8 + Tailwind CSS 4 → Android APK via Capacitor 8.
Auto-captures payments via AccessibilityService / NotificationListener.

**Current version: 1.1.0** (versionCode 5)

## Commands
- `npm run dev` — web dev server
- `npm run build` — Vite build → dist/
- `npx cap sync android` — sync web build to Android
- `npm run build-apk` — one-shot APK build (auto-increments version)
- `npm run lint` — ESLint
- **System Gradle build (if wrapper fails):** `cd android && gradle assembleDebug`
  (System Gradle at `C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat`)

## Architecture
- `src/App.jsx` — single-page shell, tab navigation
- `src/hooks/useData.js` — useTransactions, useCategories, useBudgets
- `src/services/db.js` — IndexedDB layer (stores: transactions, categories, budgets, settings)
- `src/services/autoBilling.ts` — Capacitor plugin bridge to Android native
- `src/utils/parser.js` — payment-text + CSV parser
- `src/constants/categories.js` — merchant-name to category keyword matching
- `android/` — AccessibilityService, ForegroundService, NotificationListener, ClipboardMonitor

## Native Android Files
- `BillingAccessibilityService.java` — payment success screen auto-capture
- `BillingNotificationListener.java` — notification parsing (amount, merchant, counterparty, refund detection, promo filter)
- `BillingForegroundService.java` — keep-alive foreground service
- `ClipboardMonitor.java` — clipboard text parsing
- `TransactionReceiver.java` — dedup (source+fingerprint+secondary, same amount+platform within 1 min)
- `BootReceiver.java` / `KeepAliveReceiver.java` / `ServiceRestarter.java` — service recovery
- `AutoBillingPlugin.java` — Capacitor plugin (accessibility, notification, battery, system settings)

## Data Flow
Android native captures → Capacitor plugin → App.jsx polls every 5s → matches CATEGORY_KEYWORDS → db.add('transactions', ...)

## Key Features (v1.1.0)
- AccessibilityService auto-capture with 10s debounce
- NotificationListener with COUNTERPARTY_PATTERN extraction + refund detection + promo filtering
- ClipboardMonitor for web payment info
- Frontend dedup (same amount+platform within same minute)
- Premium glass-card UI design system (backdrop-blur, animations)
- System settings controls (auto-start, background activity) for Chinese ROMs
- Smart categorization by merchant name
- Budget tracking with overspend warnings
- Excel export with formatted columns

## Rules
- Never write IndexedDB directly; use helpers from `src/services/db.js`
- After Android native changes: `npx cap sync android`
- Version in `android/app/build.gradle` + `package.json`; build script syncs both
- Components in `src/components/`; shared state via hooks in `src/hooks/`
- Prefer Tailwind utilities; avoid custom CSS
- Java files must be UTF-8 **without BOM** (PowerShell `Set-Content -Encoding UTF8` adds BOM; use `[System.Text.UTF8Encoding]::new($false)`)
- Use system Gradle at `C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat` for APK builds (wrapper may fail in restricted networks)
- Set `$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"` before Gradle build