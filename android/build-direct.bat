@echo off
setlocal

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"

REM ????java?????gradlew?JAVA_HOME??
set "JAVA_EXE=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot\bin\java.exe"

if not exist "%JAVA_EXE%" (
    echo ERROR: Java not found at %JAVA_EXE%
    exit /b 1
)

echo Java: %JAVA_EXE%
echo Android SDK: %ANDROID_HOME%

cd /d "E:\AI\AI Coding\Billing APP\android"

REM ???java??gradle wrapper
"%JAVA_EXE%" -jar gradle\wrapper\gradle-wrapper.jar assembleDebug

exit /b %errorlevel%
