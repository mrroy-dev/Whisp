# Whisp Icon Assets Application Script (PowerShell)
# Copies icon assets to Chromium source

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WhispRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$ChromiumSrc = Join-Path $WhispRoot "..\chromium\src"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Applying Whisp Icon Assets" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

if (-not (Test-Path $ChromiumSrc)) {
    Write-Host "Error: Chromium source not found at $ChromiumSrc" -ForegroundColor Red
    Write-Host "Please ensure Chromium is cloned in the parent directory"
    exit 1
}

Write-Host "Whisp Root: $WhispRoot" -ForegroundColor Green
Write-Host "Chromium Source: $ChromiumSrc" -ForegroundColor Green
Write-Host ""

# Linux Icons
Write-Host "[1/4] Copying Linux icons..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\linux\*.png") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\linux\") -Force -Verbose
Write-Host "Linux icons copied" -ForegroundColor Green
Write-Host ""

# macOS AppIcon.appiconset
Write-Host "[2/4] Copying macOS AppIcon.appiconset..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\mac\AppIcon.appiconset\*.png") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\mac\Assets.xcassets\AppIcon.appiconset\") -Force -Verbose
Write-Host "macOS AppIcon.appiconset copied" -ForegroundColor Green
Write-Host ""

# macOS Icon.iconset
Write-Host "[3/4] Copying macOS Icon.iconset..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\mac\Icon.iconset\*.png") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\mac\Assets.xcassets\Icon.iconset\") -Force -Verbose
Write-Host "macOS Icon.iconset copied" -ForegroundColor Green
Write-Host ""

# macOS ICNS and Assets.car
Write-Host "[4/4] Copying macOS ICNS and Assets.car..." -ForegroundColor Blue
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\mac\app.icns") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\mac\") -Force -Verbose
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\mac\AppIcon.icns") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\mac\") -Force -Verbose
Copy-Item -Path (Join-Path $WhispRoot "branding_assets\icons\mac\Assets.car") `
         -Destination (Join-Path $ChromiumSrc "chrome\app\theme\chromium\mac\") -Force -Verbose
Write-Host "macOS ICNS and Assets.car copied" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  All icon assets applied!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Icon assets have been copied to Chromium source."
Write-Host "Next steps:"
Write-Host "  1. cd ..\chromium\src"
Write-Host "  2. autoninja -C out\fast chrome"
