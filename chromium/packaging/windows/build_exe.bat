@echo off
REM Build Whisp EXE installer for Windows
REM Uses Chromium's mini_installer (NSIS-based) target

setlocal enabledelayedexpansion

set WHISP_ROOT=%~dp0..\..
set CHROMIUM_OUT=%1
if "%CHROMIUM_OUT%"=="" set CHROMIUM_OUT=%WHISP_ROOT%\..\chromium\src\out\whisp
set OUTPUT_DIR=%2
if "%OUTPUT_DIR%"=="" set OUTPUT_DIR=%WHISP_ROOT%\dist

echo ========================================
echo   Whisp EXE Installer Builder
echo ========================================
echo Chromium out: %CHROMIUM_OUT%
echo Output:       %OUTPUT_DIR%
echo=

if not exist "%CHROMIUM_OUT%" (
    echo ERROR: Chromium build output not found at %CHROMIUM_OUT%
    echo Build Chromium first: autoninja -C %CHROMIUM_OUT% chrome
    exit /b 1
)

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Building mini_installer (NSIS EXE)...
cd /d "%CHROMIUM_OUT%\.."
call autoninja -C "%CHROMIUM_OUT%" mini_installer

if exist "%CHROMIUM_OUT%\mini_installer.exe" (
    copy /y "%CHROMIUM_OUT%\mini_installer.exe" "%OUTPUT_DIR%\Whisp_Setup.exe"
    echo EXE installer created: %OUTPUT_DIR%\Whisp_Setup.exe
) else (
    echo WARNING: mini_installer.exe not found
    echo Try building: autoninja -C "%CHROMIUM_OUT%" mini_installer
)

echo Done.
