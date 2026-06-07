@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║   影记-StealthLedger - APK 构建脚本   ║
echo ╚════════════════════════════════════════╝
echo.

:: ===== Step 0: Auto-increment version =====
echo [0/6] 自动递增版本号...

:: Extract current version from build.gradle
for /f "tokens=2 delims= " %%a in ('findstr /r "versionName" android\app\build.gradle') do set CUR_VERSION=%%~a
set CUR_VERSION=!CUR_VERSION:"=!

echo    当前版本: v!CUR_VERSION!

:: Parse major.minor.patch
for /f "tokens=1,2,3 delims=." %%a in ("!CUR_VERSION!") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

:: Special case: 1.0.0 → 1.1.0, otherwise increment patch
if "!CUR_VERSION!"=="1.0.0" (
    set NEW_MAJOR=1
    set NEW_MINOR=1
    set NEW_PATCH=0
) else (
    set /a NEW_PATCH=!PATCH!+1
    set NEW_MAJOR=!MAJOR!
    set NEW_MINOR=!MINOR!
)
set NEW_VERSION=!NEW_MAJOR!.!NEW_MINOR!.!NEW_PATCH!
echo    新版本号: v!NEW_VERSION!

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

echo    ✓ 版本号已更新: v!CUR_VERSION! → v!NEW_VERSION!

:: ===== Step 1: Check Java =====
echo.
echo [1/6] 检查 Java 环境...

set JAVA_FOUND=0
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set JAVA_FOUND=1
        set JAVA_PATH=%JAVA_HOME%\bin
        echo    ✓ 找到 JAVA_HOME: %JAVA_HOME%
    )
)

if !JAVA_FOUND!==0 (
    for %%i in (java.exe) do (
        set JAVA_FOUND=1
        echo    ✓ 找到 java
    )
)

if !JAVA_FOUND!==0 (
    echo    ✗ 未找到 Java，正在尝试通过 winget 安装...
    winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo.
        echo    ⚠ 自动安装失败，请手动安装 JDK 17+
        pause
        exit /b 1
    )
    for /f "tokens=*" %%i in ('where java 2^>nul') do set JAVA_PATH=%%~dpi
)

:: ===== Step 2: Check Android SDK =====
echo.
echo [2/6] 检查 Android SDK...

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
    echo    ⚠ 未找到 Android SDK
    pause
    exit /b 1
)
echo    ✓ Android SDK: !ANDROID_HOME!
echo sdk.dir=!ANDROID_HOME!> android\local.properties

:: ===== Step 3: Build Web App =====
echo.
echo [3/6] 构建 Web 前端...

call npm run build
if errorlevel 1 (
    echo    ✗ Web 构建失败
    pause
    exit /b 1
)

call npx cap sync android
if errorlevel 1 (
    echo    ✗ Capacitor 同步失败
    pause
    exit /b 1
)
echo    ✓ Web 资源已同步

:: ===== Step 4: Build APK =====
echo.
echo [4/6] 编译 Android APK...

cd android

if not exist "debug.keystore" (
    echo    生成签名密钥...
    "%JAVA_HOME%\bin\keytool" -genkey -v ^
        -keystore debug.keystore ^
        -alias androiddebugkey ^
        -keyalg RSA -keysize 2048 -validity 10000 ^
        -storepass android -keypass android ^
        -dname "CN=Android Debug, O=AutoBilling, C=CN" 2>nul
)

echo    正在编译 (可能需要几分钟)...
call gradlew.bat assembleDebug
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo    ✗ APK 编译失败
    pause
    exit /b 1
)

:: ===== Step 5: Copy APK to release =====
echo.
echo [5/6] 输出 APK 到 release 目录...

set APK_SOURCE=android\app\build\outputs\apk\debug\app-debug.apk
set APK_DEST=release\影记-StealthLedger-v!NEW_VERSION!.apk

if not exist "release" mkdir "release"

if exist "%APK_SOURCE%" (
    copy /Y "%APK_SOURCE%" "%APK_DEST%" >nul
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║  🎉 APK 构建成功！                     ║
    echo ╠════════════════════════════════════════╣
    echo ║  版本:   v!NEW_VERSION!
    echo ║  文件名: 影记-StealthLedger-v!NEW_VERSION!.apk
    for %%A in ("%APK_DEST%") do echo ║  大小:   %%~zA 字节
    echo ╚════════════════════════════════════════╝
    echo.
) else (
    echo    ✗ 未找到 APK: %APK_SOURCE%
    pause
    exit /b 1
)

:: ===== Step 6: Commit version bump to Git =====
echo.
echo [6/6] 提交版本号到 Git...

git add android\app\build.gradle package.json
git commit -m "build: bump version to v!NEW_VERSION!" 2>nul
if errorlevel 1 (
    echo    ⚠ Git 提交失败 (可能无变更或未初始化)
) else (
    echo    ✓ 已提交版本更新: v!NEW_VERSION!
)

echo.
echo ════════════════════════════════════════════
echo   下一步: 下次构建时版本将自动递增
echo ════════════════════════════════════════════
echo.
pause