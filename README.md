# 馃摫 褰辫 StealthLedger

> 鏀粯鍗宠褰曪紝鍛婂埆鎵嬪姩璁拌处 鈥?Auto-track expenses from Alipay & WeChat Pay, no manual entry needed.
> Effortless expense tracking on Android.

[![GitHub Stars](https://img.shields.io/github/stars/y3078266584/StealthLedger?style=social&label=Star)](https://github.com/y3078266584/StealthLedger)
[![GitHub Forks](https://img.shields.io/github/forks/y3078266584/StealthLedger?style=social&label=Fork)](https://github.com/y3078266584/StealthLedger)
[![Version](https://img.shields.io/badge/version-1.1.2-blue)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Android](https://img.shields.io/badge/Android-8%2B-34A853?logo=android)](https://developer.android.com)

---

## 馃摝 涓嬭浇 / Download

> [猬?涓嬭浇鏈€鏂扮増 v1.0.3 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.1.2/-StealthLedger-v1.1.2.apk)
> [猬?Download latest v1.1.2 APK](https://github.com/y3078266584/StealthLedger/releases/download/v1.1.2/-StealthLedger-v1.1.2.apk)
>
> 鍘嗗彶鐗堟湰璇峰墠寰€ [Releases](https://github.com/y3078266584/StealthLedger/releases) 椤甸潰涓嬭浇銆?> For older versions, visit the [Releases](https://github.com/y3078266584/StealthLedger/releases) page.

---

## 鉁?鏍稿績鍔熻兘 / Features

### 馃敭 鑷姩鏃犳劅鎹曡幏 / Auto Capture
- **Android 鏃犻殰纰嶆湇鍔?/ Accessibility Service** 鈥?鏀粯鎴愬姛鍚庤嚜鍔ㄨ瘑鍒睆骞曚笂鐨勯噾棰濅笌鍟嗘埛锛岄潤榛樺畬鎴愯璐?  *Auto-detect amounts & merchants on payment success screens, silently log transactions.*
- **閫氱煡鏍忕洃鍚?/ Notification Listener** 鈥?瑙ｆ瀽鏀粯瀹?寰俊鏀粯閫氱煡锛屾彁鍙栭噾棰濅俊鎭?  *Parse Alipay & WeChat Pay notifications to extract payment data.*
- **鍓创鏉跨洃鍚?/ Clipboard Monitor** 鈥?Web 绔鍒舵敮浠樹俊鎭嵆鍙嚜鍔ㄨ瘑鍒?  *Copy payment info on web and it's recognized automatically.*
- **鏅鸿兘鍒嗙被 / Smart Categorization** 鈥?鏍规嵁鍟嗘埛鍚嶇О鑷姩鍖归厤娑堣垂绫诲埆
  *Auto-match categories by merchant name.*

### 馃搳 璁拌处绠＄悊 / Transaction Management
- 鎵嬪姩娣诲姞 / 缂栬緫 / 鍒犻櫎浜ゆ槗璁板綍 鈥?*Add, edit, delete transactions manually*
- **鎵归噺閫夋嫨鍒犻櫎 / Batch Delete** 鈥?澶氶€変氦鏄撲竴閿竻鐞?鈥?*Select multiple & delete in one tap*
- **骞冲彴鏍囪 / Platform Tags** 鈥?鏀寔鏍囪鏀粯骞冲彴锛堟敮浠樺疂 / 寰俊 / 鎵嬪姩锛夛紝缂栬緫鏃跺彲淇敼 鈥?*Tag by platform (Alipay / WeChat / Manual)*
- 13 绉嶉粯璁ゆ櫤鑳藉垎绫?+ 鑷畾涔夊垎绫伙紙鍥炬爣 + 棰滆壊锛夆€?*13 default categories + custom (icon & color)*
- 澶氱淮搴︾瓫閫夛細鍏抽敭璇嶆悳绱€佹棩鏈熴€佺被鍨嬨€佸垎绫?鈥?*Multi-filter: keyword, date, type, category*

### 馃搱 鏁版嵁鍙鍖?/ Data Visualization
- 浠〃鏉跨粺璁″崱鐗囷紙浠婃棩 / 鏈湀 / 骞村害鏀舵敮锛夆€?*Dashboard cards: Today / Month / Year*
- 鏈堝害姣忔棩鏀嚭瓒嬪娍鍥撅紙娓愬彉鑹叉煴鐘跺浘锛夆€?*Monthly daily expense bar chart (gradient)*
- 娑堣垂鍒嗙被鍗犳瘮锛堢幆褰㈤ゼ鍥撅級鈥?*Category breakdown (donut chart)*
- 棰勭畻杩涘害璺熻釜锛堟笎鍙樿壊杩涘害鏉?+ 瓒呮敮棰勮锛夆€?*Budget tracker with overspend warning*
- 鐜瘮鍙樺寲鐧惧垎姣?鈥?*Period-over-period percentage change*

### 馃捑 鏁版嵁绠＄悊 / Data Management
- 鍏ㄩ儴鏁版嵁鏈湴瀛樺偍锛圛ndexedDB锛夛紝**闆剁綉缁滀緷璧?* 鈥?*100% local storage, zero network*
- **Excel (.xlsx) 瀵煎嚭** 鈥?甯︽牸寮忕殑鐢靛瓙琛ㄦ牸 鈥?*Formatted Excel export with all fields*
- 鏁版嵁涓€閿竻绌?鈥?*One-tap clear all data*
- 澶囦唤鏁版嵁浠呭瓨鍌ㄥ湪璁惧鏈湴锛屼笉涓婁紶浠讳綍鏈嶅姟鍣?鈥?*Data never leaves your device*

---

## 馃彈 鎶€鏈爤 / Tech Stack

| Layer / 灞傜骇 | Technology / 鎶€鏈?|
|-------------|-------------------|
| Frontend Framework / 鍓嶇妗嗘灦 | React 19 |
| Build Tool / 鏋勫缓宸ュ叿 | Vite 8 |
| CSS Framework / 鏍峰紡鏂规 | Tailwind CSS 4 |
| Charts / 鍥捐〃搴?| Recharts |
| Local Storage / 鏈湴瀛樺偍 | IndexedDB (idb) |
| Excel Export / Excel 瀵煎嚭 | SheetJS (xlsx) |
| CSV Import / CSV 瀵煎叆 | PapaParse |
| Icons / 鍥炬爣搴?| Lucide React |
| Mobile Wrapper / 绉诲姩绔皝瑁?| Capacitor 8 |
| Android Native / Android 鍘熺敓 | AccessibilityService + BroadcastReceiver |

---

## 馃殌 蹇€熷紑濮?/ Quick Start

### 鐜瑕佹眰 / Prerequisites

- **Node.js** 鈮?18
- **JDK 17+**锛堜粎 Android 鏋勫缓闇€瑕?/ Android build only锛?- **Android Studio**锛堜粎 Android 鏋勫缓闇€瑕?/ Android build only锛?
### Web 寮€鍙?/ Web Dev

```bash
# 瀹夎渚濊禆 / Install dependencies
npm install

# 鍚姩寮€鍙戞湇鍔″櫒 / Start dev server
npm run dev

# 鏋勫缓鐢熶骇鐗堟湰 / Build for production
npm run build
```

### Android 鏋勫缓 / Android Build

```bash
# 鏂瑰紡涓€ / Option 1锛氫竴閿瀯寤?/ One-shot build
scripts\build-apk.bat

# 鏂瑰紡浜?/ Option 2锛氭墜鍔ㄦ瀯寤?/ Manual build
npm run build
npx cap sync android
cd android && gradlew assembleDebug
```

鏋勫缓浜х墿 / Output锛歚褰辫-StealthLedger-vX.Y.Z.apk`

### 棣栨浣跨敤 / First Use

1. 瀹夎 APK 鍒版墜鏈?/ *Install APK on your phone*
2. 鍓嶅線 **璁剧疆 鈫?鏃犻殰纰?鈫?宸插畨瑁呯殑鏈嶅姟**锛屽紑鍚€屽奖璁般€? *Settings 鈫?Accessibility 鈫?Installed apps 鈫?Enable "褰辫"*
3. 寮€鍚€氱煡鐩戝惉鏉冮檺鍜岀數姹犱紭鍖栬眮鍏?/ *Enable notification listener & battery optimization exemption*
4. 姝ゅ悗浣跨敤鏀粯瀹?/ 寰俊浠樻锛岄噾棰濆皢鑷姩璁板綍 鉁?/ *Use Alipay or WeChat Pay 鈥?transactions logged automatically*

---

## 馃搨 椤圭洰缁撴瀯 / Project Structure

```
StealthLedger/
鈹溾攢鈹€ src/                              # React 鍓嶇婧愮爜 / React frontend
鈹?  鈹溾攢鈹€ constants/                    # 甯搁噺閰嶇疆 / Constants
鈹?  鈹?  鈹斺攢鈹€ categories.js             # 鍟嗘埛鍚?鈫?娑堣垂鍒嗙被鏄犲皠 / Merchant 鈫?category
鈹?  鈹溾攢鈹€ services/                     # 鏈嶅姟灞?/ Services (DB, native bridge)
鈹?  鈹?  鈹溾攢鈹€ db.js                     # IndexedDB 灏佽 / IndexedDB wrapper
鈹?  鈹?  鈹斺攢鈹€ autoBilling.ts            # Capacitor 鍘熺敓鎻掍欢妗ユ帴 / Native plugin bridge
鈹?  鈹溾攢鈹€ components/                   # UI 缁勪欢 / UI Components
鈹?  鈹?  鈹溾攢鈹€ Layout.jsx                # 甯冨眬锛堜晶杈规爮 + 椤舵爮锛? Sidebar + top bar
鈹?  鈹?  鈹溾攢鈹€ Dashboard.jsx             # 浠〃鏉匡紙缁熻鍗＄墖 + 鍥捐〃锛? Stats & charts
鈹?  鈹?  鈹溾攢鈹€ TransactionList.jsx       # 浜ゆ槗鍒楄〃锛堟悳绱?绛涢€?鎵归噺鎿嶄綔锛? List view
鈹?  鈹?  鈹溾攢鈹€ TransactionForm.jsx       # 娣诲姞/缂栬緫琛ㄥ崟锛堝惈骞冲彴閫夋嫨锛? Add/Edit form
鈹?  鈹?  鈹溾攢鈹€ CategoryManager.jsx       # 鍒嗙被绠＄悊锛堝鍒犳敼锛? Category CRUD
鈹?  鈹?  鈹溾攢鈹€ BudgetTracker.jsx         # 棰勭畻绠＄悊 / Budget management
鈹?  鈹?  鈹溾攢鈹€ ImportModal.jsx           # CSV 璐﹀崟瀵煎叆 / CSV import
鈹?  鈹?  鈹斺攢鈹€ Settings.jsx              # 璁剧疆锛堟湇鍔＄姸鎬?鏁版嵁绠＄悊锛? Settings
鈹?  鈹溾攢鈹€ hooks/                        # React Hooks
鈹?  鈹?  鈹斺攢鈹€ useData.js                # 鏁版嵁灞傛ˉ鎺?/ Data layer bridge
鈹?  鈹溾攢鈹€ utils/                        # 宸ュ叿搴?/ Utilities
鈹?  鈹?  鈹斺攢鈹€ parser.js                 # 鏀粯鏂囨湰瑙ｆ瀽 + CSV 瑙ｆ瀽 / Text & CSV parser
鈹?  鈹溾攢鈹€ App.jsx                       # 涓诲簲鐢ㄥ叆鍙?/ App entry
鈹?  鈹溾攢鈹€ index.css                     # Tailwind CSS + 鍏ㄥ眬鏍峰紡 / Global styles
鈹?  鈹斺攢鈹€ main.jsx                      # Vite 鍏ュ彛 / Vite entry
鈹溾攢鈹€ android/                          # Android 鍘熺敓妯″潡 / Android native
鈹?  鈹斺攢鈹€ app/src/main/
鈹?      鈹溾攢鈹€ AndroidManifest.xml        # 鏉冮檺涓庣粍浠舵敞鍐?/ Permissions & components
鈹?      鈹斺攢鈹€ java/com/autobilling/
鈹?          鈹溾攢鈹€ app/MainActivity.java  # 涓?Activity
鈹?          鈹溾攢鈹€ plugin/               # Capacitor 鍘熺敓鎻掍欢 / Native plugin
鈹?          鈹?  鈹斺攢鈹€ AutoBillingPlugin.java
鈹?          鈹溾攢鈹€ service/              # 鍚庡彴鏈嶅姟 / Background services
鈹?          鈹?  鈹溾攢鈹€ BillingAccessibilityService.java  # 鏃犻殰纰嶈璐?/ Auto-capture
鈹?          鈹?  鈹溾攢鈹€ BillingForegroundService.java     # 鍓嶅彴淇濇椿 / Keep-alive
鈹?          鈹?  鈹溾攢鈹€ BillingNotificationListener.java  # 閫氱煡鏍忕洃鍚?/ Notification
鈹?          鈹?  鈹斺攢鈹€ ClipboardMonitor.java            # 鍓创鏉跨洃鍚?/ Clipboard
鈹?          鈹斺攢鈹€ receiver/             # 骞挎挱鎺ユ敹鍣?/ Broadcast receivers
鈹?              鈹溾攢鈹€ BootReceiver.java          # 寮€鏈鸿嚜鍚?/ Boot start
鈹?              鈹溾攢鈹€ KeepAliveReceiver.java     # 瀹氭椂淇濇椿 / Periodic keep-alive
鈹?              鈹溾攢鈹€ ServiceRestarter.java      # JobScheduler 閲嶅惎 / Restart
鈹?              鈹斺攢鈹€ TransactionReceiver.java   # 浜ゆ槗鏁版嵁鎺ユ敹 / Transaction data
鈹溾攢鈹€ public/                           # 闈欐€佽祫婧?/ Static assets
鈹溾攢鈹€ scripts/                          # 鏋勫缓鑴氭湰 / Build scripts
鈹?  鈹斺攢鈹€ build-apk.bat                 # 涓€閿瀯寤?APK / One-shot APK build
鈹溾攢鈹€ release/                          # 鏋勫缓浜х墿 / Release APKs
鈹?  鈹溾攢鈹€ 褰辫-StealthLedger-v1.1.2.apk
鈹?  鈹斺攢鈹€ 褰辫-StealthLedger-v1.1.2.apk
鈹溾攢鈹€ index.html                        # HTML 鍏ュ彛 / HTML entry
鈹溾攢鈹€ vite.config.js                    # Vite 閰嶇疆 / Vite config
鈹溾攢鈹€ capacitor.config.json             # Capacitor 閰嶇疆 / Capacitor config
鈹溾攢鈹€ package.json                      # 渚濊禆涓庤剼鏈?/ Dependencies & scripts
鈹溾攢鈹€ eslint.config.js                  # ESLint 閰嶇疆 / ESLint config
鈹溾攢鈹€ .gitignore                        # Git 蹇界暐瑙勫垯 / Git ignore
鈹溾攢鈹€ LICENSE                           # MIT 鍗忚 / MIT License
鈹斺攢鈹€ README.md                         # 椤圭洰璇存槑 / You are here
```

---

## 馃敀 闅愮璇存槑 / Privacy

| Item / 椤圭洰 | Description / 璇存槑 |
|------------|-------------------|
| 鏁版嵁瀛樺偍 / Storage | 100% 鏈湴瀛樺偍锛屾棤鏈嶅姟鍣ㄤ笂浼?鈥?*100% local, no server upload* |
| 鏃犻殰纰嶆湇鍔?/ Accessibility | **浠?*鍦ㄦ敮浠樻垚鍔熼〉闈㈣鍙栭噾棰濅笌鍟嗘埛鍚?鈥?*Only reads amount & merchant on success screen* |
| 鏁忔劅淇℃伅 / Sensitive Data | 涓嶈鍙栧瘑鐮併€侀獙璇佺爜銆佽亰澶╄褰曠瓑 鈥?*Never reads passwords, OTPs, chats* |
| 缃戠粶璇锋眰 / Network | 涓嶅彂璧蜂换浣曠綉缁滆姹?鈥?*Zero network requests* |
| 寮€婧愰€忔槑 / Transparency | 鍏ㄩ儴浠ｇ爜鍙鏌?鈥?*Fully open-source & auditable* |

---

## 馃幆 鑷姩璁拌处娴佺▼ / How It Works

```
鐢ㄦ埛浣跨敤鏀粯瀹?寰俊浠樻
User pays with Alipay / WeChat Pay
        鈫?鏀粯鎴愬姛椤甸潰鍑虹幇
Payment success screen appears
        鈫?Android AccessibilityService 妫€娴嬪埌椤甸潰
AccessibilityService detects the screen
        鈫?閬嶅巻鏃犻殰纰嶈妭鐐规爲锛屾彁鍙栭噾棰?+ 鍟嗘埛 + 鏃堕棿
Traverses node tree 鈫?extracts amount, merchant, time
        鈫?Broadcast 鈫?TransactionReceiver 鎺ユ敹
Broadcast 鈫?received by TransactionReceiver
        鈫?鏁版嵁鍐欏叆鏈湴 IndexedDB 鈫?WebView 鑷姩鍒锋柊
Data written to IndexedDB 鈫?WebView auto-refreshes
        鈫?鐢ㄦ埛鎵撳紑 App 鍗冲彲鐪嬪埌宸茶嚜鍔ㄨ褰曠殑璐﹀崟 鉁?Open the app 鈥?your expenses are already logged
```

---

## 馃摑 璺嚎鍥?/ Roadmap

- [x] Android 鏃犻殰纰嶆湇鍔¤嚜鍔ㄦ崟鑾?/ *Auto-capture via AccessibilityService*
- [x] 閫氱煡鏍忚В鏋?/ *Notification parsing*
- [x] 鍓创鏉跨洃鍚?/ *Clipboard monitoring*
- [x] 澶氱淮搴︾瓫閫変笌鎼滅储 / *Multi-dimensional filtering & search*
- [x] 鎵归噺鍒犻櫎 / *Batch delete*
- [x] 鏁版嵁鍙鍖栦华琛ㄦ澘 / *Data visualization dashboard*
- [x] 棰勭畻绠＄悊 / *Budget tracking*
- [x] Excel 瀵煎嚭 / *Excel export*
- [x] 骞冲彴鏍囪锛堟敮浠樺疂 / 寰俊锛? *Platform tagging*
- [ ] iOS 蹇嵎鎸囦护闆嗘垚 / *iOS Shortcuts integration*
- [ ] 鏁版嵁浜戝悓姝ワ紙鍙€夛紝鍔犲瘑锛? *Optional encrypted cloud sync*
- [ ] AI 鏅鸿兘鍒嗙被浼樺寲 / *AI-powered categorization*
- [ ] 鍛ㄦ湡鎬ц处鍗曟彁閱?/ *Recurring bill reminders*
- [ ] 澶氳处鎴锋敮鎸?/ *Multi-account support*

---

## 猸?Star History

[![Star History Chart](https://api.star-history.com/svg?repos=y3078266584/StealthLedger&type=Date)](https://star-history.com/#y3078266584/StealthLedger&Date)

## 馃搫 License

MIT

---

Made with 鉂わ笍 for effortless expense tracking 路 璁╄璐﹀儚鍛煎惛涓€鏍疯嚜鐒?