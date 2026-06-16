@echo off
REM Build Whisp MSI installer for Windows
REM Uses Chromium's chrome_msi (WiX-based) target

setlocal enabledelayedexpansion

set WHISP_ROOT=%~dp0..\..
set CHROMIUM_OUT=%1
if "%CHROMIUM_OUT%"=="" set CHROMIUM_OUT=%WHISP_ROOT%\..\chromium\src\out\whisp
set OUTPUT_DIR=%2
if "%OUTPUT_DIR%"=="" set OUTPUT_DIR=%WHISP_ROOT%\dist

echo ========================================
echo   Whisp MSI Installer Builder
echo ========================================
echo Chromium out: %CHROMIUM_OUT%
echo Output:       %OUTPUT_DIR%
echo=

if not exist "%CHROMIUM_OUT%" (
    echo ERROR: Chromium build output not found at %CHROMIUM_OUT%
    exit /b 1
)

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Building chrome_msi (WiX MSI)...
cd /d "%CHROMIUM_OUT%\.."
call autoninja -C "%CHROMIUM_OUT%" chrome_msi

if exist "%CHROMIUM_OUT%\chrome.msi" (
    copy /y "%CHROMIUM_OUT%\chrome.msi" "%OUTPUT_DIR%\Whisp.msi"
    echo MSI installer created: %OUTPUT_DIR%\Whisp.msi
) else (
    echo WARNING: chrome.msi not found
    echo Try building: autoninja -C "%CHROMIUM_OUT%" chrome_msi
)

echo Done.
