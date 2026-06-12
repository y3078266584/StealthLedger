# StealthLedger (影记) — Agent Guidelines

## Project
React 19 SPA + Vite 8 + Tailwind CSS 4 → Android APK via Capacitor 8.
Auto-captures payments via AccessibilityService / NotificationListener.

**Current version: 1.0.3** (versionCode 4)

## Commands
- 
pm run dev — web dev server
- 
pm run build — Vite build → dist/
- 
px cap sync android — sync web build to Android
- 
pm run build-apk — one-shot APK build (auto-increments version)
- 
pm run lint — ESLint
- **System Gradle build (if wrapper fails):** cd android && gradle assembleDebug
  (System Gradle at C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat)

## Architecture
- src/App.jsx — single-page shell, tab navigation
- src/hooks/useData.js — useTransactions, useCategories, useBudgets
- src/services/db.js — IndexedDB layer (stores: transactions, categories, budgets, settings)
- src/services/autoBilling.ts — Capacitor plugin bridge to Android native
- src/utils/parser.js — payment-text + CSV parser
- src/constants/categories.js — merchant-name to category keyword matching
- ndroid/ — AccessibilityService, ForegroundService, NotificationListener, ClipboardMonitor

## Native Android Files
- BillingAccessibilityService.java — payment success screen auto-capture
- BillingNotificationListener.java — notification parsing (amount, merchant, counterparty, refund detection)
- BillingForegroundService.java — keep-alive foreground service
- ClipboardMonitor.java — clipboard text parsing
- TransactionReceiver.java — dedup (source+fingerprint+secondary, same amount+platform within 1 min)
- BootReceiver.java / KeepAliveReceiver.java / ServiceRestarter.java — service recovery

## Data Flow
Android native captures → Capacitor plugin → App.jsx polls every 5s → matches CATEGORY_KEYWORDS → db.add('transactions', ...)

## Key Features (v1.0.3)
- AccessibilityService auto-capture with 10s debounce
- NotificationListener with COUNTERPARTY_PATTERN extraction
- Refund detection (auto-set type=income)
- Incoming money detection
- Promo/ad notification filtering (< 0.5 amounts)
- HH:mm:ss precise time capture
- Frontend dedup (same amount+platform within same minute)

## Rules
- Never write IndexedDB directly; use helpers from src/services/db.js
- After Android native changes: 
px cap sync android
- Version in ndroid/app/build.gradle + package.json; build script syncs both
- Components in src/components/; shared state via hooks in src/hooks/
- Prefer Tailwind utilities; avoid custom CSS
- Java files must be UTF-8 **without BOM** (PowerShell Set-Content adds BOM by default)
- Use system Gradle at C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat for APK builds