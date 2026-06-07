# 📱 影记 StealthLedger

> 支付即记录，告别手动记账 — Auto-track expenses from Alipay & WeChat Pay, no manual entry needed.
> Effortless expense tracking on Android.

[![GitHub Stars](https://img.shields.io/github/stars/y3078266584/StealthLedger?style=social&label=Star)](https://github.com/y3078266584/StealthLedger)
[![GitHub Forks](https://img.shields.io/github/forks/y3078266584/StealthLedger?style=social&label=Fork)](https://github.com/y3078266584/StealthLedger)
[![Version](https://img.shields.io/badge/version-1.0.2-blue)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Android](https://img.shields.io/badge/Android-8%2B-34A853?logo=android)](https://developer.android.com)

---

## 📦 下载 / Download

> [⬇ 下载最新版 v1.0.2 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.0.2/-StealthLedger-v1.0.2.apk)
> [⬇ Download latest v1.0.2 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.0.2/-StealthLedger-v1.0.2.apk)
>
> 历史版本请前往 [Releases](https://github.com/y3078266584/StealthLedger/releases) 页面下载。
> For older versions, visit the [Releases](https://github.com/y3078266584/StealthLedger/releases) page.

---

## ✨ 核心功能 / Features

### 🔮 自动无感捕获 / Auto Capture
- **Android 无障碍服务 / Accessibility Service** — 支付成功后自动识别屏幕上的金额与商户，静默完成记账
  *Auto-detect amounts & merchants on payment success screens, silently log transactions.*
- **通知栏监听 / Notification Listener** — 解析支付宝/微信支付通知，提取金额信息
  *Parse Alipay & WeChat Pay notifications to extract payment data.*
- **剪贴板监听 / Clipboard Monitor** — Web 端复制支付信息即可自动识别
  *Copy payment info on web and it's recognized automatically.*
- **智能分类 / Smart Categorization** — 根据商户名称自动匹配消费类别
  *Auto-match categories by merchant name.*

### 📊 记账管理 / Transaction Management
- 手动添加 / 编辑 / 删除交易记录 — *Add, edit, delete transactions manually*
- **批量选择删除 / Batch Delete** — 多选交易一键清理 — *Select multiple & delete in one tap*
- **平台标记 / Platform Tags** — 支持标记支付平台（支付宝 / 微信 / 手动），编辑时可修改 — *Tag by platform (Alipay / WeChat / Manual)*
- 13 种默认智能分类 + 自定义分类（图标 + 颜色）— *13 default categories + custom (icon & color)*
- 多维度筛选：关键词搜索、日期、类型、分类 — *Multi-filter: keyword, date, type, category*

### 📈 数据可视化 / Data Visualization
- 仪表板统计卡片（今日 / 本月 / 年度收支）— *Dashboard cards: Today / Month / Year*
- 月度每日支出趋势图（渐变色柱状图）— *Monthly daily expense bar chart (gradient)*
- 消费分类占比（环形饼图）— *Category breakdown (donut chart)*
- 预算进度跟踪（渐变色进度条 + 超支预警）— *Budget tracker with overspend warning*
- 环比变化百分比 — *Period-over-period percentage change*

### 💾 数据管理 / Data Management
- 全部数据本地存储（IndexedDB），**零网络依赖** — *100% local storage, zero network*
- **Excel (.xlsx) 导出** — 带格式的电子表格 — *Formatted Excel export with all fields*
- 数据一键清空 — *One-tap clear all data*
- 备份数据仅存储在设备本地，不上传任何服务器 — *Data never leaves your device*

---

## 🏗 技术栈 / Tech Stack

| Layer / 层级 | Technology / 技术 |
|-------------|-------------------|
| Frontend Framework / 前端框架 | React 19 |
| Build Tool / 构建工具 | Vite 8 |
| CSS Framework / 样式方案 | Tailwind CSS 4 |
| Charts / 图表库 | Recharts |
| Local Storage / 本地存储 | IndexedDB (idb) |
| Excel Export / Excel 导出 | SheetJS (xlsx) |
| CSV Import / CSV 导入 | PapaParse |
| Icons / 图标库 | Lucide React |
| Mobile Wrapper / 移动端封装 | Capacitor 8 |
| Android Native / Android 原生 | AccessibilityService + BroadcastReceiver |

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites

- **Node.js** ≥ 18
- **JDK 17+**（仅 Android 构建需要 / Android build only）
- **Android Studio**（仅 Android 构建需要 / Android build only）

### Web 开发 / Web Dev

```bash
# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev

# 构建生产版本 / Build for production
npm run build
```

### Android 构建 / Android Build

```bash
# 方式一 / Option 1：一键构建 / One-shot build
scripts\build-apk.bat

# 方式二 / Option 2：手动构建 / Manual build
npm run build
npx cap sync android
cd android && gradlew assembleDebug
```

构建产物 / Output：`影记-StealthLedger-vX.Y.Z.apk`

### 首次使用 / First Use

1. 安装 APK 到手机 / *Install APK on your phone*
2. 前往 **设置 → 无障碍 → 已安装的服务**，开启「影记」/ *Settings → Accessibility → Installed apps → Enable "影记"*
3. 开启通知监听权限和电池优化豁免 / *Enable notification listener & battery optimization exemption*
4. 此后使用支付宝 / 微信付款，金额将自动记录 ✅ / *Use Alipay or WeChat Pay — transactions logged automatically*

---

## 📂 项目结构 / Project Structure

```
StealthLedger/
├── src/                              # React 前端源码 / React frontend
│   ├── constants/                    # 常量配置 / Constants
│   │   └── categories.js             # 商户名 → 消费分类映射 / Merchant → category
│   ├── services/                     # 服务层 / Services (DB, native bridge)
│   │   ├── db.js                     # IndexedDB 封装 / IndexedDB wrapper
│   │   └── autoBilling.ts            # Capacitor 原生插件桥接 / Native plugin bridge
│   ├── components/                   # UI 组件 / UI Components
│   │   ├── Layout.jsx                # 布局（侧边栏 + 顶栏）/ Sidebar + top bar
│   │   ├── Dashboard.jsx             # 仪表板（统计卡片 + 图表）/ Stats & charts
│   │   ├── TransactionList.jsx       # 交易列表（搜索/筛选/批量操作）/ List view
│   │   ├── TransactionForm.jsx       # 添加/编辑表单（含平台选择）/ Add/Edit form
│   │   ├── CategoryManager.jsx       # 分类管理（增删改）/ Category CRUD
│   │   ├── BudgetTracker.jsx         # 预算管理 / Budget management
│   │   ├── ImportModal.jsx           # CSV 账单导入 / CSV import
│   │   └── Settings.jsx              # 设置（服务状态/数据管理）/ Settings
│   ├── hooks/                        # React Hooks
│   │   └── useData.js                # 数据层桥接 / Data layer bridge
│   ├── utils/                        # 工具库 / Utilities
│   │   └── parser.js                 # 支付文本解析 + CSV 解析 / Text & CSV parser
│   ├── App.jsx                       # 主应用入口 / App entry
│   ├── index.css                     # Tailwind CSS + 全局样式 / Global styles
│   └── main.jsx                      # Vite 入口 / Vite entry
├── android/                          # Android 原生模块 / Android native
│   └── app/src/main/
│       ├── AndroidManifest.xml        # 权限与组件注册 / Permissions & components
│       └── java/com/autobilling/
│           ├── app/MainActivity.java  # 主 Activity
│           ├── plugin/               # Capacitor 原生插件 / Native plugin
│           │   └── AutoBillingPlugin.java
│           ├── service/              # 后台服务 / Background services
│           │   ├── BillingAccessibilityService.java  # 无障碍记账 / Auto-capture
│           │   ├── BillingForegroundService.java     # 前台保活 / Keep-alive
│           │   ├── BillingNotificationListener.java  # 通知栏监听 / Notification
│           │   └── ClipboardMonitor.java            # 剪贴板监听 / Clipboard
│           └── receiver/             # 广播接收器 / Broadcast receivers
│               ├── BootReceiver.java          # 开机自启 / Boot start
│               ├── KeepAliveReceiver.java     # 定时保活 / Periodic keep-alive
│               ├── ServiceRestarter.java      # JobScheduler 重启 / Restart
│               └── TransactionReceiver.java   # 交易数据接收 / Transaction data
├── public/                           # 静态资源 / Static assets
├── scripts/                          # 构建脚本 / Build scripts
│   └── build-apk.bat                 # 一键构建 APK / One-shot APK build
├── release/                          # 构建产物 / Release APKs
│   ├── 影记-StealthLedger-v1.0.1.apk
│   └── 影记-StealthLedger-v1.0.2.apk
├── index.html                        # HTML 入口 / HTML entry
├── vite.config.js                    # Vite 配置 / Vite config
├── capacitor.config.json             # Capacitor 配置 / Capacitor config
├── package.json                      # 依赖与脚本 / Dependencies & scripts
├── eslint.config.js                  # ESLint 配置 / ESLint config
├── .gitignore                        # Git 忽略规则 / Git ignore
├── LICENSE                           # MIT 协议 / MIT License
└── README.md                         # 项目说明 / You are here
```

---

## 🔒 隐私说明 / Privacy

| Item / 项目 | Description / 说明 |
|------------|-------------------|
| 数据存储 / Storage | 100% 本地存储，无服务器上传 — *100% local, no server upload* |
| 无障碍服务 / Accessibility | **仅**在支付成功页面读取金额与商户名 — *Only reads amount & merchant on success screen* |
| 敏感信息 / Sensitive Data | 不读取密码、验证码、聊天记录等 — *Never reads passwords, OTPs, chats* |
| 网络请求 / Network | 不发起任何网络请求 — *Zero network requests* |
| 开源透明 / Transparency | 全部代码可审查 — *Fully open-source & auditable* |

---

## 🎯 自动记账流程 / How It Works

```
用户使用支付宝/微信付款
User pays with Alipay / WeChat Pay
        ↓
支付成功页面出现
Payment success screen appears
        ↓
Android AccessibilityService 检测到页面
AccessibilityService detects the screen
        ↓
遍历无障碍节点树，提取金额 + 商户 + 时间
Traverses node tree → extracts amount, merchant, time
        ↓
Broadcast → TransactionReceiver 接收
Broadcast → received by TransactionReceiver
        ↓
数据写入本地 IndexedDB → WebView 自动刷新
Data written to IndexedDB → WebView auto-refreshes
        ↓
用户打开 App 即可看到已自动记录的账单 ✅
Open the app — your expenses are already logged
```

---

## 📝 路线图 / Roadmap

- [x] Android 无障碍服务自动捕获 / *Auto-capture via AccessibilityService*
- [x] 通知栏解析 / *Notification parsing*
- [x] 剪贴板监听 / *Clipboard monitoring*
- [x] 多维度筛选与搜索 / *Multi-dimensional filtering & search*
- [x] 批量删除 / *Batch delete*
- [x] 数据可视化仪表板 / *Data visualization dashboard*
- [x] 预算管理 / *Budget tracking*
- [x] Excel 导出 / *Excel export*
- [x] 平台标记（支付宝 / 微信）/ *Platform tagging*
- [ ] iOS 快捷指令集成 / *iOS Shortcuts integration*
- [ ] 数据云同步（可选，加密）/ *Optional encrypted cloud sync*
- [ ] AI 智能分类优化 / *AI-powered categorization*
- [ ] 周期性账单提醒 / *Recurring bill reminders*
- [ ] 多账户支持 / *Multi-account support*

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=y3078266584/StealthLedger&type=Date)](https://star-history.com/#y3078266584/StealthLedger&Date)

## 📄 License

MIT

---

Made with ❤️ for effortless expense tracking · 让记账像呼吸一样自然
