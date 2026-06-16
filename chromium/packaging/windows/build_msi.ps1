# Build Whisp MSI installer for Windows
# Uses Chromium's chrome_msi (WiX-based) target

param(
    [string]$ChromiumOut = "",
    [string]$OutputDir = ""
)

$WhispRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
if (-not $ChromiumOut) { $ChromiumOut = Join-Path $WhispRoot "..\chromium\src\out\whisp" }
if (-not $OutputDir) { $OutputDir = Join-Path $WhispRoot "dist" }

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Whisp MSI Installer Builder" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Chromium out: $ChromiumOut"
Write-Host "Output:       $OutputDir"
Write-Host ""

if (-not (Test-Path $ChromiumOut)) {
    Write-Host "ERROR: Chromium build output not found at $ChromiumOut" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Building chrome_msi (WiX MSI)..." -ForegroundColor Blue
Push-Location (Join-Path $ChromiumOut "..")
& autoninja -C $ChromiumOut chrome_msi
Pop-Location

$msi = Join-Path $ChromiumOut "chrome.msi"
if (Test-Path $msi) {
    Copy-Item $msi (Join-Path $OutputDir "Whisp.msi") -Force
    Write-Host "MSI installer created: $OutputDir\Whisp.msi" -ForegroundColor Green
} else {
    Write-Host "WARNING: chrome.msi not found" -ForegroundColor Yellow
}

Write-Host "Done."
