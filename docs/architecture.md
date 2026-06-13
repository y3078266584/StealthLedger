# 影记 StealthLedger — 系统架构

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 19 + Vite 8 |
| 样式 | Tailwind CSS 4 |
| 图表 | Recharts 3 |
| 存储 | IndexedDB (via idb) |
| 移动端 | Capacitor 8 → Android |
| Excel | SheetJS (xlsx) |

## 项目结构

`
StealthLedger/
├── src/                      # 前端源码
│   ├── main.jsx              # 入口
│   ├── App.jsx               # 主应用 shell，页面路由
│   ├── index.css             # Tailwind + 全局样式
│   ├── components/           # UI 组件
│   ├── constants/            # 常量（分类关键词）
│   ├── hooks/                # 自定义 hooks
│   ├── services/             # 服务层（db, 自动记账桥接）
│   └── utils/                # 工具函数
├── android/                  # Android 原生项目
│   └── app/src/main/java/com/autobilling/app/service/
│       ├── BillingAccessibilityService.java  # 无障碍服务 → 屏幕捕获
│       ├── BillingNotificationListener.java  # 通知监听 → 支付通知解析
│       ├── BillingForegroundService.java     # 前台保活服务
│       ├── ClipboardMonitor.java             # 剪贴板监听
│       ├── TransactionReceiver.java          # 交易去重接收器
│       ├── BootReceiver.java                 # 开机自启
│       ├── KeepAliveReceiver.java            # 定时保活
│       └── ServiceRestarter.java             # 服务重启恢复
│   └── app/src/main/java/com/autobilling/app/
│       ├── MainActivity.java                 # Android 入口
│       └── AutoBillingPlugin.java            # Capacitor 插件桥
├── public/                   # 静态资源
├── scripts/                  # 构建脚本
├── docs/                     # 文档
└── release/                  # APK 发布包
`

## 数据流

`
用户支付 → 支付成功页/通知
  → Android 原生服务捕获
    (AccessibilityService / NotificationListener / ClipboardMonitor)
  → Broadcast → TransactionReceiver（去重）
  → Capacitor Plugin Bridge (AutoBillingPlugin.java)
  → WebView 每 5s 轮询 → App.jsx 接收
  → CATEGORY_KEYWORDS 匹配分类
  → IndexedDB 存储 → UI 自动刷新
`

## 数据库 (IndexedDB)

| Store | 用途 |
|---|---|
| transactions | 交易记录（金额、商户、平台、时间、分类、类型） |
| categories | 分类（名称、图标、颜色、关键词） |
| budgets | 月度预算 |
| settings | 应用设置 |

## 关键特性

- **v1.1.0**: 无障碍+通知监听自动记账、剪贴板、分类、预算、Excel导出
- **v1.1.1**: 支付宝自动扣款修复（地铁/打车）、更多通知字段读取
- **v1.1.2**: 通用支付检测（移除包名白名单）、复合去重键