# 影记 StealthLedger

> 自动记录支付宝/微信支付账单，无需手动输入。  
> Auto-track expenses from Alipay & WeChat Pay, no manual entry needed.

[![GitHub Stars](https://img.shields.io/github/stars/y3078266584/StealthLedger?style=social)](https://github.com/y3078266584/StealthLedger)
[![GitHub Forks](https://img.shields.io/github/forks/y3078266584/StealthLedger?style=social)](https://github.com/y3078266584/StealthLedger)
[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://github.com/y3078266584/StealthLedger/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Android](https://img.shields.io/badge/Android-8+-34A853?logo=android)](https://developer.android.com)

---

## 下载 Download

**最新版 Latest:** [📱 影记-StealthLedger v1.1.2 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.1.2/%E5%BD%B1%E8%AE%B0-StealthLedger-v1.1.2.apk)

> 📌 旧版 APK 请访问 [Releases](https://github.com/y3078266584/StealthLedger/releases) 页面下载。  
> For older versions, visit the [Releases](https://github.com/y3078266584/StealthLedger/releases) page.

---

## 功能 Features

### 自动记账 / Auto Capture

- **无障碍服务 / Accessibility Service** — 支付成功页自动检测金额和商户，静默记录  
  Auto-detect amounts & merchants on payment success screens, silently log transactions.

- **通知栏监听 / Notification Listener** — 解析支付宝/微信支付通知，提取交易数据  
  Parse Alipay & WeChat Pay notifications to extract payment data.

- **剪贴板监听 / Clipboard Monitor** — Web 支付时复制支付信息即可自动识别  
  Copy payment info on web and it's recognized automatically.

- **通用检测 / Universal Detection** — 任意 APP 的支付页面和通知均可捕获（v1.1.2+）  
  Any app's payment screen or notification can be captured.

- **智能分类 / Smart Categorization** — 根据商户名称自动匹配分类  
  Auto-match categories by merchant name.

### 交易管理 / Transaction Management

- 添加/编辑/删除 / Add, edit, delete transactions
- 批量删除 / Batch delete multiple transactions
- 平台标签（支付宝/微信/手动录入）/ Platform tags (Alipay / WeChat / Manual)
- 13 种默认分类 + 自定义（图标+颜色）/ 13 default categories + custom (icon & color)
- 多维度筛选：关键词、日期、类型、分类 / Multi-filter: keyword, date, type, category

### 数据看板 / Data Visualization

- 概览卡片：今日/本月/全年 / Dashboard cards: Today / Month / Year
- 月度每日消费柱状图 / Monthly daily expense bar chart
- 分类占比环形图 / Category breakdown donut chart
- 预算追踪与超支提醒 / Budget tracker with overspend warning
- 环比变化百分比 / Period-over-period percentage change

### 数据管理 / Data Management

- **100% 本地存储**，无需网络 / 100% local storage, zero network
- **Excel (.xlsx) 导出**，含格式化列宽 / Formatted Excel export with all fields
- 一键清空所有数据 / One-tap clear all data
- CSV 导入备份 / CSV import for backup

---

## 截图 Screenshots

| 仪表盘 Dashboard | 交易列表 Transactions | 设置 Settings |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) | ![Settings](docs/screenshots/settings.png) |

> 📸 *截图待添加 — Screenshots coming soon*

---

## 工作原理 How It Works

`
用户支付 / User pays (Alipay / WeChat)
    ↓ 支付成功页或通知 / Payment success screen or notification
    ↓ Android 原生服务捕获 / Native services capture
        ├── AccessibilityService — 解析屏幕节点树 / Parse screen node tree
        ├── NotificationListener — 解析通知字段 / Parse notification fields
        └── ClipboardMonitor — 解析剪贴板 / Parse clipboard text
    ↓ Broadcast → TransactionReceiver（去重 / Dedup）
    ↓ Capacitor Plugin Bridge (AutoBillingPlugin.java)
    ↓ WebView 每 5s 轮询 / Poll every 5s → App.jsx
    ↓ CATEGORY_KEYWORDS 匹配分类 / Match category
    ↓ IndexedDB 存储 / Storage → UI 自动刷新 / Auto refresh
`

---

## 项目结构 Project Structure

| 目录 / Path | 说明 / Description |
|---|---|
| src/ | 前端源码 / Frontend source (React + Vite) |
| ndroid/ | Android 原生项目 / Android native project |
| public/ | 静态资源 / Static assets |
| scripts/ | 构建脚本 / Build scripts |
| docs/ | 文档 / Documentation |

详见 [docs/architecture.md](docs/architecture.md) — See [docs/architecture.md](docs/architecture.md)

---

## 开发 Development

`ash
# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev

# 构建前端 / Build frontend
npm run build

# 同步到 Android / Sync to Android
npx cap sync android

# 构建 APK / Build APK（需 Android SDK 和 JDK 17+）
npm run build-apk
`

> **系统 Gradle** 路径: C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat  
> 构建前设置 ANDROID_HOME：$env:ANDROID_HOME = "C:\Users\30782\AppData\Local\Android\Sdk"

---

## 隐私 Privacy

| 项目 / Item | 说明 / Description |
|---|---|
| 存储 / Storage | 100% 本地，不上传服务器 / 100% local, no server upload |
| 无障碍 / Accessibility | 仅读取支付成功页的金额和商户 / Only reads amount & merchant on success screen |
| 敏感数据 / Sensitive Data | 从不读取密码、验证码、聊天记录 / Never reads passwords, OTPs, chats |
| 网络 / Network | 零网络请求 / Zero network requests |
| 透明 / Transparency | 完全开源可审计 / Fully open-source & auditable |

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=y3078266584/StealthLedger&type=Date)](https://star-history.com/#y3078266584/StealthLedger&Date)

---

## 路线图 Roadmap

- [x] 无障碍自动捕获 / Auto-capture via AccessibilityService
- [x] 通知解析 / Notification parsing
- [x] 剪贴板监听 / Clipboard monitoring
- [x] 筛选与搜索 / Multi-dimensional filtering
- [x] 批量删除 / Batch delete
- [x] 数据可视化看板 / Data visualization dashboard
- [x] 预算追踪 / Budget tracking
- [x] Excel 导出 / Excel export
- [x] 平台标签 / Platform tagging
- [x] 通用支付检测 / Universal payment detection
- [ ] iOS 快捷指令集成 / iOS Shortcuts integration
- [ ] 可选加密云同步 / Optional encrypted cloud sync
- [ ] AI 智能分类 / AI-powered categorization
- [ ] 周期账单提醒 / Recurring bill reminders
- [ ] 多账户支持 / Multi-account support

---

## License

MIT

---

*Made with ❤️ for effortless expense tracking — 让记账变得简单*