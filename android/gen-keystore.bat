@echo off
echo Generating debug keystore...
if not defined JAVA_HOME (
    echo ERROR: JAVA_HOME is not set
    exit /b 1
)
"%JAVA_HOME%\bin\keytool" -genkey -v ^
  -keystore debug.keystore ^
  -alias androiddebugkey ^
  -keyalg RSA -keysize 2048 -validity 10000 ^
  -storepass android -keypass android ^
  -dname "CN=Android Debug, O=AutoBilling, C=CN"
echo Done.
