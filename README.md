# 褰辫 StealthLedger

> 鑷姩璁板綍鏀粯瀹?寰俊鏀粯璐﹀崟锛屾棤闇€鎵嬪姩杈撳叆銆? 
> Auto-track expenses from Alipay & WeChat Pay, no manual entry needed.

[![GitHub Stars](https://img.shields.io/github/stars/y3078266584/StealthLedger?style=social)](https://github.com/y3078266584/StealthLedger)
[![GitHub Forks](https://img.shields.io/github/forks/y3078266584/StealthLedger?style=social)](https://github.com/y3078266584/StealthLedger)
[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://github.com/y3078266584/StealthLedger/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Android](https://img.shields.io/badge/Android-8+-34A853?logo=android)](https://developer.android.com)

---

## 涓嬭浇 Download

**鏈€鏂扮増 Latest:** [馃摫 褰辫-StealthLedger v1.1.2 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.1.2/-StealthLedger-v1.1.2.apk)

> 馃搶 鏃х増 APK 璇疯闂?[Releases](https://github.com/y3078266584/StealthLedger/releases) 椤甸潰涓嬭浇銆? 
> For older versions, visit the [Releases](https://github.com/y3078266584/StealthLedger/releases) page.

---

## 鍔熻兘 Features

### 鑷姩璁拌处 / Auto Capture

- **鏃犻殰纰嶆湇鍔?/ Accessibility Service** 鈥?鏀粯鎴愬姛椤佃嚜鍔ㄦ娴嬮噾棰濆拰鍟嗘埛锛岄潤榛樿褰? 
  Auto-detect amounts & merchants on payment success screens, silently log transactions.

- **閫氱煡鏍忕洃鍚?/ Notification Listener** 鈥?瑙ｆ瀽鏀粯瀹?寰俊鏀粯閫氱煡锛屾彁鍙栦氦鏄撴暟鎹? 
  Parse Alipay & WeChat Pay notifications to extract payment data.

- **鍓创鏉跨洃鍚?/ Clipboard Monitor** 鈥?Web 鏀粯鏃跺鍒舵敮浠樹俊鎭嵆鍙嚜鍔ㄨ瘑鍒? 
  Copy payment info on web and it's recognized automatically.

- **閫氱敤妫€娴?/ Universal Detection** 鈥?浠绘剰 APP 鐨勬敮浠橀〉闈㈠拰閫氱煡鍧囧彲鎹曡幏锛坴1.1.2+锛? 
  Any app's payment screen or notification can be captured.

- **鏅鸿兘鍒嗙被 / Smart Categorization** 鈥?鏍规嵁鍟嗘埛鍚嶇О鑷姩鍖归厤鍒嗙被  
  Auto-match categories by merchant name.

### 浜ゆ槗绠＄悊 / Transaction Management

- 娣诲姞/缂栬緫/鍒犻櫎 / Add, edit, delete transactions
- 鎵归噺鍒犻櫎 / Batch delete multiple transactions
- 骞冲彴鏍囩锛堟敮浠樺疂/寰俊/鎵嬪姩褰曞叆锛? Platform tags (Alipay / WeChat / Manual)
- 13 绉嶉粯璁ゅ垎绫?+ 鑷畾涔夛紙鍥炬爣+棰滆壊锛? 13 default categories + custom (icon & color)
- 澶氱淮搴︾瓫閫夛細鍏抽敭璇嶃€佹棩鏈熴€佺被鍨嬨€佸垎绫?/ Multi-filter: keyword, date, type, category

### 鏁版嵁鐪嬫澘 / Data Visualization

- 姒傝鍗＄墖锛氫粖鏃?鏈湀/鍏ㄥ勾 / Dashboard cards: Today / Month / Year
- 鏈堝害姣忔棩娑堣垂鏌辩姸鍥?/ Monthly daily expense bar chart
- 鍒嗙被鍗犳瘮鐜舰鍥?/ Category breakdown donut chart
- 棰勭畻杩借釜涓庤秴鏀彁閱?/ Budget tracker with overspend warning
- 鐜瘮鍙樺寲鐧惧垎姣?/ Period-over-period percentage change

### 鏁版嵁绠＄悊 / Data Management

- **100% 鏈湴瀛樺偍**锛屾棤闇€缃戠粶 / 100% local storage, zero network
- **Excel (.xlsx) 瀵煎嚭**锛屽惈鏍煎紡鍖栧垪瀹?/ Formatted Excel export with all fields
- 涓€閿竻绌烘墍鏈夋暟鎹?/ One-tap clear all data
- CSV 瀵煎叆澶囦唤 / CSV import for backup

---

## 鎴浘 Screenshots

| 浠〃鐩?Dashboard | 浜ゆ槗鍒楄〃 Transactions | 璁剧疆 Settings |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) | ![Settings](docs/screenshots/settings.png) |

> 馃摳 *鎴浘寰呮坊鍔?鈥?Screenshots coming soon*

---

## 宸ヤ綔鍘熺悊 How It Works

`
鐢ㄦ埛鏀粯 / User pays (Alipay / WeChat)
    鈫?鏀粯鎴愬姛椤垫垨閫氱煡 / Payment success screen or notification
    鈫?Android 鍘熺敓鏈嶅姟鎹曡幏 / Native services capture
        鈹溾攢鈹€ AccessibilityService 鈥?瑙ｆ瀽灞忓箷鑺傜偣鏍?/ Parse screen node tree
        鈹溾攢鈹€ NotificationListener 鈥?瑙ｆ瀽閫氱煡瀛楁 / Parse notification fields
        鈹斺攢鈹€ ClipboardMonitor 鈥?瑙ｆ瀽鍓创鏉?/ Parse clipboard text
    鈫?Broadcast 鈫?TransactionReceiver锛堝幓閲?/ Dedup锛?    鈫?Capacitor Plugin Bridge (AutoBillingPlugin.java)
    鈫?WebView 姣?5s 杞 / Poll every 5s 鈫?App.jsx
    鈫?CATEGORY_KEYWORDS 鍖归厤鍒嗙被 / Match category
    鈫?IndexedDB 瀛樺偍 / Storage 鈫?UI 鑷姩鍒锋柊 / Auto refresh
`

---

## 椤圭洰缁撴瀯 Project Structure

| 鐩綍 / Path | 璇存槑 / Description |
|---|---|
| src/ | 鍓嶇婧愮爜 / Frontend source (React + Vite) |
| ndroid/ | Android 鍘熺敓椤圭洰 / Android native project |
| public/ | 闈欐€佽祫婧?/ Static assets |
| scripts/ | 鏋勫缓鑴氭湰 / Build scripts |
| docs/ | 鏂囨。 / Documentation |

璇﹁ [docs/architecture.md](docs/architecture.md) 鈥?See [docs/architecture.md](docs/architecture.md)

---

## 寮€鍙?Development

`ash
# 瀹夎渚濊禆 / Install dependencies
npm install

# 鍚姩寮€鍙戞湇鍔″櫒 / Start dev server
npm run dev

# 鏋勫缓鍓嶇 / Build frontend
npm run build

# 鍚屾鍒?Android / Sync to Android
npx cap sync android

# 鏋勫缓 APK / Build APK锛堥渶 Android SDK 鍜?JDK 17+锛?npm run build-apk
`

> **绯荤粺 Gradle** 璺緞: C:\Gradle\gradle-9.5.1-bin\gradle-9.5.1\bin\gradle.bat  
> 鏋勫缓鍓嶈缃?ANDROID_HOME锛?env:ANDROID_HOME = "C:\Users\30782\AppData\Local\Android\Sdk"

---

## 闅愮 Privacy

| 椤圭洰 / Item | 璇存槑 / Description |
|---|---|
| 瀛樺偍 / Storage | 100% 鏈湴锛屼笉涓婁紶鏈嶅姟鍣?/ 100% local, no server upload |
| 鏃犻殰纰?/ Accessibility | 浠呰鍙栨敮浠樻垚鍔熼〉鐨勯噾棰濆拰鍟嗘埛 / Only reads amount & merchant on success screen |
| 鏁忔劅鏁版嵁 / Sensitive Data | 浠庝笉璇诲彇瀵嗙爜銆侀獙璇佺爜銆佽亰澶╄褰?/ Never reads passwords, OTPs, chats |
| 缃戠粶 / Network | 闆剁綉缁滆姹?/ Zero network requests |
| 閫忔槑 / Transparency | 瀹屽叏寮€婧愬彲瀹¤ / Fully open-source & auditable |

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=y3078266584/StealthLedger&type=Date)](https://star-history.com/#y3078266584/StealthLedger&Date)

---

## 璺嚎鍥?Roadmap

- [x] 鏃犻殰纰嶈嚜鍔ㄦ崟鑾?/ Auto-capture via AccessibilityService
- [x] 閫氱煡瑙ｆ瀽 / Notification parsing
- [x] 鍓创鏉跨洃鍚?/ Clipboard monitoring
- [x] 绛涢€変笌鎼滅储 / Multi-dimensional filtering
- [x] 鎵归噺鍒犻櫎 / Batch delete
- [x] 鏁版嵁鍙鍖栫湅鏉?/ Data visualization dashboard
- [x] 棰勭畻杩借釜 / Budget tracking
- [x] Excel 瀵煎嚭 / Excel export
- [x] 骞冲彴鏍囩 / Platform tagging
- [x] 閫氱敤鏀粯妫€娴?/ Universal payment detection
- [ ] iOS 蹇嵎鎸囦护闆嗘垚 / iOS Shortcuts integration
- [ ] 鍙€夊姞瀵嗕簯鍚屾 / Optional encrypted cloud sync
- [ ] AI 鏅鸿兘鍒嗙被 / AI-powered categorization
- [ ] 鍛ㄦ湡璐﹀崟鎻愰啋 / Recurring bill reminders
- [ ] 澶氳处鎴锋敮鎸?/ Multi-account support

---

## License

MIT

---

*Made with 鉂わ笍 for effortless expense tracking 鈥?璁╄璐﹀彉寰楃畝鍗?