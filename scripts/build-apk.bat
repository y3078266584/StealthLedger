@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Navigate to project root
cd /d "%~dp0\.."

echo.
echo 鈺斺晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晽
echo 鈺?  褰辫-StealthLedger - APK 鏋勫缓鑴氭湰   鈺?echo 鈺氣晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暆
echo.

:: ===== Step 0: Auto-increment version =====
echo [0/6] 鑷姩閫掑鐗堟湰鍙?..

:: Extract current version from build.gradle
for /f "tokens=2 delims= " %%a in ('findstr /r "versionName" android\app\build.gradle') do set CUR_VERSION=%%~a
set CUR_VERSION=!CUR_VERSION:"=!

echo    褰撳墠鐗堟湰: v!CUR_VERSION!

:: Parse major.minor.patch
for /f "tokens=1,2,3 delims=." %%a in ("!CUR_VERSION!") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

:: Always increment patch (last digit)
set /a NEW_PATCH=!PATCH!+1
set NEW_VERSION=!MAJOR!.!MINOR!.!NEW_PATCH!
echo    鏂扮増鏈彿: v!NEW_VERSION!

:: Calculate versionCode (increment by 1)
for /f "tokens=2 delims= " %%a in ('findstr /r "versionCode" android\app\build.gradle') do set CUR_CODE=%%a
set /a NEW_CODE=!CUR_CODE!+1

:: Update build.gradle
powershell -NoProfile -Command ^
    "$f='android\app\build.gradle';" ^
    "$c=(Get-Content $f -Raw);" ^
    "$c=$c -replace 'versionCode \d+','versionCode !NEW_CODE!';" ^
    "$c=$c -replace 'versionName \""!CUR_VERSION!\""','versionName \""!NEW_VERSION!\""';" ^
    "[System.IO.File]::WriteAllBytes($f,[System.Text.Encoding]::UTF8.GetBytes($c))"

:: Update package.json
powershell -NoProfile -Command ^
    "$f='package.json';" ^
    "$c=(Get-Content $f -Raw);" ^
    "$c=$c -replace '\""version\""\s*:\s*\""!CUR_VERSION!\""','\""version\"": \""!NEW_VERSION!\""';" ^
    "[System.IO.File]::WriteAllBytes($f,[System.Text.Encoding]::UTF8.GetBytes($c))"

echo    鉁?鐗堟湰鍙峰凡鏇存柊: v!CUR_VERSION! 鈫?v!NEW_VERSION!

:: ===== Step 1: Check Java =====
echo.
echo [1/6] 妫€鏌?Java 鐜...

set JAVA_FOUND=0
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set JAVA_FOUND=1
        set JAVA_PATH=%JAVA_HOME%\bin
        echo    鉁?鎵惧埌 JAVA_HOME: %JAVA_HOME%
    )
)

if !JAVA_FOUND!==0 (
    for %%i in (java.exe) do (
        set JAVA_FOUND=1
        echo    鉁?鎵惧埌 java
    )
)

if !JAVA_FOUND!==0 (
    echo    鉁?鏈壘鍒?Java锛屾鍦ㄥ皾璇曢€氳繃 winget 瀹夎...
    winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo.
        echo    鈿?鑷姩瀹夎澶辫触锛岃鎵嬪姩瀹夎 JDK 17+
        pause
        exit /b 1
    )
    for /f "tokens=*" %%i in ('where java 2^>nul') do set JAVA_PATH=%%~dpi
)

:: ===== Step 2: Check Android SDK =====
echo.
echo [2/6] 妫€鏌?Android SDK...

set SDK_FOUND=0
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%\platforms" set SDK_FOUND=1
)
if defined ANDROID_SDK_ROOT (
    if exist "%ANDROID_SDK_ROOT%\platforms" set SDK_FOUND=1
)
if !SDK_FOUND!==0 (
    if exist "%LOCALAPPDATA%\Android\Sdk\platforms" (
        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
        set SDK_FOUND=1
    )
)

if !SDK_FOUND!==0 (
    echo    鈿?鏈壘鍒?Android SDK
    pause
    exit /b 1
)
echo    鉁?Android SDK: !ANDROID_HOME!
echo sdk.dir=!ANDROID_HOME!> android\local.properties

:: ===== Step 3: Build Web App =====
echo.
echo [3/6] 鏋勫缓 Web 鍓嶇...

call npm run build
if errorlevel 1 (
    echo    鉁?Web 鏋勫缓澶辫触
    pause
    exit /b 1
)

call npx cap sync android
if errorlevel 1 (
    echo    鉁?Capacitor 鍚屾澶辫触
    pause
    exit /b 1
)
echo    鉁?Web 璧勬簮宸插悓姝?
:: ===== Step 4: Build APK =====
echo.
echo [4/6] 缂栬瘧 Android APK...

cd android

if not exist "debug.keystore" (
    echo    鐢熸垚绛惧悕瀵嗛挜...
    "%JAVA_HOME%\bin\keytool" -genkey -v ^
        -keystore debug.keystore ^
        -alias androiddebugkey ^
        -keyalg RSA -keysize 2048 -validity 10000 ^
        -storepass android -keypass android ^
        -dname "CN=Android Debug, O=AutoBilling, C=CN" 2>nul
)

echo    姝ｅ湪缂栬瘧 (鍙兘闇€瑕佸嚑鍒嗛挓)...
call gradlew.bat assembleDebug
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo    鉁?APK 缂栬瘧澶辫触
    pause
    exit /b 1
)

:: ===== Step 5: Copy APK to release =====
echo.
echo [5/6] 杈撳嚭 APK 鍒?release 鐩綍...

set APK_SOURCE=android\app\build\outputs\apk\debug\app-debug.apk
set APK_DEST=release\褰辫-StealthLedger-v!NEW_VERSION!.apk

if not exist "release" mkdir "release"

if exist "%APK_SOURCE%" (
    copy /Y "%APK_SOURCE%" "%APK_DEST%" >nul
    echo.
    echo 鈺斺晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晽
    echo 鈺? 馃帀 APK 鏋勫缓鎴愬姛锛?                    鈺?    echo 鈺犫晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暎
    echo 鈺? 鐗堟湰:   v!NEW_VERSION!
    echo 鈺? 鏂囦欢鍚? 褰辫-StealthLedger-v!NEW_VERSION!.apk
    for %%A in ("%APK_DEST%") do echo 鈺? 澶у皬:   %%~zA 瀛楄妭
    echo 鈺氣晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暆
    echo.
) else (
    echo    鉁?鏈壘鍒?APK: %APK_SOURCE%
    pause
    exit /b 1
)

:: ===== Step 6: Commit version bump to Git =====
echo.
echo [6/6] 鎻愪氦鐗堟湰鍙峰埌 Git...

git add android\app\build.gradle package.json
git commit -m "build: bump version to v!NEW_VERSION!" 2>nul
if errorlevel 1 (
    echo    鈿?Git 鎻愪氦澶辫触 (鍙兘鏃犲彉鏇存垨鏈垵濮嬪寲)
) else (
    echo    鉁?宸叉彁浜ょ増鏈洿鏂? v!NEW_VERSION!
)

echo.
echo 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
echo   涓嬩竴姝? 涓嬫鏋勫缓鏃剁増鏈皢鑷姩閫掑
echo 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
echo.
pause