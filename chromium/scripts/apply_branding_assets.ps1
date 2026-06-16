# Whisp Branding Assets Application Script (PowerShell)
# Copies branding assets to Chromium source tree

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WhChromiumDir = Split-Path -Parent $ScriptDir
$WhRoot = Split-Path -Parent $WhChromiumDir
$ChromiumSourceDir = if ($env:CHROMIUM_SRC) { $env:CHROMIUM_SRC } else { Join-Path $WhRoot "..\chromium\src" }
$BrandingAssetsDir = Join-Path $WhRoot "branding_assets"

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Applying Whisp Branding Assets" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Assets source: $BrandingAssetsDir"
Write-Host "Chromium source: $ChromiumSourceDir"
Write-Host ""

if (-not (Test-Path $ChromiumSourceDir)) {
    Write-Host "ERROR: Chromium source directory not found at $ChromiumSourceDir" -ForegroundColor Red
    Write-Host "Set CHROMIUM_SRC environment variable or run from correct location"
    exit 1
}

if (-not (Test-Path $BrandingAssetsDir)) {
    Write-Host "ERROR: Branding assets directory not found at $BrandingAssetsDir" -ForegroundColor Red
    exit 1
}

function Copy-Asset {
    param($RelativeSrc, $RelativeDest)
    $src = Join-Path $BrandingAssetsDir $RelativeSrc
    $dest = Join-Path $ChromiumSourceDir $RelativeDest

    if (-not (Test-Path $src)) {
        Write-Host "WARNING: Source file not found: $src" -ForegroundColor Yellow
        return
    }

    $destDir = Split-Path -Parent $dest
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    Copy-Item $src $dest -Force
    Write-Host "Copied: $RelativeSrc -> $RelativeDest" -ForegroundColor Green
}

Write-Host "Copying macOS app icons..."
Copy-Asset "icons/mac/app.icns" "chrome/app/theme/chromium/mac/app.icns"
Copy-Asset "icons/mac/app-temp.icns" "chrome/app/theme/chromium/mac/app-temp.icns"
Write-Host ""

Write-Host "Copying SVG logos..."
Copy-Asset "svg/product_logo.svg" "chrome/app/theme/chromium/product_logo.svg"
Write-Host ""

Write-Host "Copying root product logos..."
Copy-Asset "product_logo_128.png" "chrome/app/theme/chromium/product_logo_128.png"
Copy-Asset "product_logo_16.png" "chrome/app/theme/chromium/product_logo_16.png"
Copy-Asset "product_logo_22_mono.png" "chrome/app/theme/chromium/product_logo_22_mono.png"
Copy-Asset "product_logo_24.png" "chrome/app/theme/chromium/product_logo_24.png"
Copy-Asset "product_logo_256.png" "chrome/app/theme/chromium/product_logo_256.png"
Copy-Asset "product_logo_48.png" "chrome/app/theme/chromium/product_logo_48.png"
Copy-Asset "product_logo_64.png" "chrome/app/theme/chromium/product_logo_64.png"
Write-Host ""

Write-Host "Copying 100% scale assets..."
Copy-Asset "100_percent/product_logo_16.png" "chrome/app/theme/default_100_percent/chromium/product_logo_16.png"
Copy-Asset "100_percent/product_logo_16_white.png" "chrome/app/theme/default_100_percent/chromium/product_logo_16_white.png"
Copy-Asset "100_percent/product_logo_32.png" "chrome/app/theme/default_100_percent/chromium/product_logo_32.png"
Copy-Asset "100_percent/product_logo_32_white.png" "chrome/app/theme/default_100_percent/chromium/product_logo_32_white.png"
Copy-Asset "100_percent/product_logo_name_22.png" "chrome/app/theme/default_100_percent/chromium/product_logo_name_22.png"
Copy-Asset "100_percent/product_logo_name_22_white.png" "chrome/app/theme/default_100_percent/chromium/product_logo_name_22_white.png"
Copy-Asset "100_percent/product_logo_16_root.png" "chrome/app/theme/default_100_percent/product_logo_16.png"
Write-Host ""

Write-Host "Copying 200% scale assets..."
Copy-Asset "200_percent/product_logo_16.png" "chrome/app/theme/default_200_percent/chromium/product_logo_16.png"
Copy-Asset "200_percent/product_logo_16_white.png" "chrome/app/theme/default_200_percent/chromium/product_logo_16_white.png"
Copy-Asset "200_percent/product_logo_32.png" "chrome/app/theme/default_200_percent/chromium/product_logo_32.png"
Copy-Asset "200_percent/product_logo_32_white.png" "chrome/app/theme/default_200_percent/chromium/product_logo_32_white.png"
Copy-Asset "200_percent/product_logo_name_22.png" "chrome/app/theme/default_200_percent/chromium/product_logo_name_22.png"
Copy-Asset "200_percent/product_logo_name_22_white.png" "chrome/app/theme/default_200_percent/chromium/product_logo_name_22_white.png"
Write-Host ""

Write-Host "Copying common assets (favicons)..."
Copy-Asset "common/favicon_ntp_100.png" "chrome/app/theme/default_100_percent/common/favicon_ntp.png"
Copy-Asset "common/favicon_ntp_200.png" "chrome/app/theme/default_200_percent/common/favicon_ntp.png"
Write-Host ""

Write-Host "Copying new tab page icons..."
Copy-Asset "ntp_icons/black_logo.svg" "chrome/browser/resources/new_tab_page/icons/Black logo.svg"
Copy-Asset "ntp_icons/whisp_logo_black.png" "chrome/browser/resources/new_tab_page/icons/whisp_logo_black.png"
Copy-Asset "ntp_icons/whisp_logo_white.png" "chrome/browser/resources/new_tab_page/icons/whisp_logo_white.png"
Write-Host ""

Write-Host "Copying side panel icons..."
Copy-Asset "side_panel_icons/mini_new_tab_page.svg" "chrome/browser/resources/side_panel/customize_chrome/icons/mini_new_tab_page.svg"
Write-Host ""

Write-Host "Copying vector icons..."
Copy-Asset "vector_icons/whisp_logo.icon" "chrome/app/vector_icons/whisp_logo.icon"
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Branding assets applied successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
