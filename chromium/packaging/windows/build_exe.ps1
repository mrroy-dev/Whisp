# Build Whisp EXE installer for Windows
# Uses Chromium's mini_installer (NSIS-based) target

param(
    [string]$ChromiumOut = "",
    [string]$OutputDir = ""
)

$WhispRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
if (-not $ChromiumOut) { $ChromiumOut = Join-Path $WhispRoot "..\chromium\src\out\whisp" }
if (-not $OutputDir) { $OutputDir = Join-Path $WhispRoot "dist" }

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Whisp EXE Installer Builder" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Chromium out: $ChromiumOut"
Write-Host "Output:       $OutputDir"
Write-Host ""

if (-not (Test-Path $ChromiumOut)) {
    Write-Host "ERROR: Chromium build output not found at $ChromiumOut" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Building mini_installer (NSIS EXE)..." -ForegroundColor Blue
Push-Location (Join-Path $ChromiumOut "..")
& autoninja -C $ChromiumOut mini_installer
Pop-Location

$installer = Join-Path $ChromiumOut "mini_installer.exe"
if (Test-Path $installer) {
    Copy-Item $installer (Join-Path $OutputDir "Whisp_Setup.exe") -Force
    Write-Host "EXE installer created: $OutputDir\Whisp_Setup.exe" -ForegroundColor Green
} else {
    Write-Host "WARNING: mini_installer.exe not found" -ForegroundColor Yellow
}

Write-Host "Done."
