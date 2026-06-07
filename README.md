# 📱 影记 StealthLedger

> 支付宝 / 微信支付后自动无感记账 — 支付即记录，告别手动记账

[![GitHub Stars](https://img.shields.io/github/stars/y3078266584/StealthLedger?style=social&label=Star)](https://github.com/y3078266584/StealthLedger)
[![GitHub Forks](https://img.shields.io/github/forks/y3078266584/StealthLedger?style=social&label=Fork)](https://github.com/y3078266584/StealthLedger)
[![Version](https://img.shields.io/badge/version-1.1.0-blue)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Android](https://img.shields.io/badge/Android-8%2B-34A853?logo=android)](https://developer.android.com)

---

## ✨ 核心功能

### 🔮 自动无感捕获
- **Android 无障碍服务** — 支付成功后自动识别屏幕上的金额与商户，静默完成记账
- **通知栏监听** — 解析支付宝/微信支付通知，提取金额信息
- **剪贴板监听** — Web 端复制支付信息即可自动识别
- **智能分类** — 根据商户名称自动匹配消费类别

### 📊 记账管理
- 手动添加 / 编辑 / 删除交易记录
- **批量选择删除** — 多选交易一键清理
- **平台标记** — 支持标记支付平台（支付宝 / 微信 / 手动），编辑时可修改
- 13 种默认智能分类 + 自定义分类（图标 + 颜色）
- 多维度筛选：关键词搜索、日期、类型、分类

### 📈 数据可视化
- 仪表板统计卡片（今日 / 本月 / 年度收支）
- 月度每日支出趋势图（渐变色柱状图）
- 消费分类占比（环形饼图）
- 预算进度跟踪（渐变色进度条 + 超支预警）
- 环比变化百分比

### 💾 数据管理
- 全部数据本地存储（IndexedDB），**零网络依赖**
- **Excel (.xlsx) 导出** — 带格式的电子表格，含日期/时间/类型/分类/商户/金额/备注/来源
- 数据一键清空
- 备份数据仅存储在设备本地，不上传任何服务器

---

## 🏗 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 |
| 构建工具 | Vite 8 |
| 样式方案 | Tailwind CSS 4 |
| 图表库 | Recharts |
| 本地存储 | IndexedDB (idb) |
| Excel 导出 | SheetJS (xlsx) |
| CSV 导入 | PapaParse |
| 图标库 | Lucide React |
| 移动端封装 | Capacitor 8 |
| Android 原生 | AccessibilityService + BroadcastReceiver |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18
- **JDK 17+**（仅 Android 构建需要）
- **Android Studio**（仅 Android 构建需要）

### Web 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Android 构建

```bash
# 方式一：一键构建
build-apk.bat

# 方式二：手动构建
npm run build
npx cap sync android
cd android && gradlew assembleDebug
```

构建产物位于根目录，命名格式：`影记-StealthLedger-vX.Y.Z.apk`

### 首次使用

1. 安装 APK 到手机
2. 前往 **设置 → 无障碍 → 已安装的服务**，开启「影记」
3. 开启通知监听权限和电池优化豁免
4. 此后使用支付宝 / 微信付款，金额将自动记录 ✅

---

## 📂 项目结构

```
Billing APP/
├── src/                              # React 前端源码
│   ├── components/
│   │   ├── Layout.jsx                # 布局（侧边栏 + 顶栏）
│   │   ├── Dashboard.jsx             # 仪表板（统计卡片 + 图表）
│   │   ├── TransactionList.jsx       # 交易列表（搜索 / 筛选 / 批量操作）
│   │   ├── TransactionForm.jsx       # 添加 / 编辑表单（含平台选择）
│   │   ├── CategoryManager.jsx       # 分类管理（增删改）
│   │   ├── BudgetTracker.jsx         # 预算管理
│   │   ├── ImportModal.jsx           # CSV 账单导入
│   │   └── Settings.jsx              # 设置（服务状态 / 数据管理）
│   ├── hooks/
│   │   └── useData.js                # React Hooks（数据层桥接）
│   ├── utils/
│   │   ├── db.js                     # IndexedDB 封装
│   │   └── parser.js                 # 支付文本解析 + CSV 解析
│   ├── plugin/
│   │   └── autoBilling.ts            # Capacitor 原生插件接口
│   ├── App.jsx                       # 主应用入口
│   └── main.jsx                      # Vite 入口
├── android/                          # Android 原生模块
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/autobilling/
│       │   ├── service/
│       │   │   └── BillingAccessibilityService.java
│       │   └── receiver/
│       │       └── TransactionReceiver.java
│       └── res/
│           ├── xml/accessibility_service_config.xml
│           └── values/strings.xml
├── public/                           # 静态资源
├── index.html
├── vite.config.js
├── package.json
├── build-apk.bat                     # 一键构建脚本
└── .gitignore
```

---

## 🔒 隐私说明

| 项目 | 说明 |
|------|------|
| 数据存储 | 100% 本地存储，无服务器上传 |
| 无障碍服务 | **仅**在支付成功页面读取金额与商户名 |
| 敏感信息 | 不读取密码、验证码、聊天记录等 |
| 网络请求 | 不发起任何网络请求 |
| 开源透明 | 全部代码可审查 |

---

## 🎯 自动记账流程

```
用户使用支付宝/微信付款
        ↓
支付成功页面出现
        ↓
Android AccessibilityService 检测到页面
        ↓
遍历无障碍节点树，提取金额 + 商户 + 时间
        ↓
Broadcast → TransactionReceiver 接收
        ↓
数据写入本地 IndexedDB → WebView 自动刷新
        ↓
用户打开 App 即可看到已自动记录的账单 ✅
```

---

## 📝 路线图

- [x] Android 无障碍服务自动捕获
- [x] 通知栏解析
- [x] 剪贴板监听
- [x] 多维度筛选与搜索
- [x] 批量删除
- [x] 数据可视化仪表板
- [x] 预算管理
- [x] Excel 导出
- [x] 平台标记（支付宝 / 微信）
- [ ] iOS 快捷指令集成
- [ ] 数据云同步（可选，加密）
- [ ] AI 智能分类优化
- [ ] 周期性账单提醒
- [ ] 多账户支持

---

## 📄 License

MIT

---

Made with ❤️ for effortless expense tracking
