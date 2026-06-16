# Whisp Complete Setup Script (PowerShell)
# Runs all necessary scripts to set up Whisp in Chromium

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Whisp Complete Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:"
Write-Host "  1. Apply all patches"
Write-Host "  2. Copy branding assets"
Write-Host "  3. Copy icon assets"
Write-Host "  4. Copy extension to resources"
Write-Host ""

# Step 1: Apply patches
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host "Step 1/4: Applying Patches" -ForegroundColor Blue
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host ""

$patchResult = & "$ScriptDir\apply_patches.ps1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Patches applied successfully" -ForegroundColor Green
} else {
    Write-Host "Patch application failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

# Step 2: Apply branding assets
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host "Step 2/4: Applying Branding Assets" -ForegroundColor Blue
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host ""

$brandingResult = & "$ScriptDir\apply_branding_assets.ps1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Branding assets applied successfully" -ForegroundColor Green
} else {
    Write-Host "Branding assets application failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

# Step 3: Apply icon assets
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host "Step 3/4: Applying Icon Assets" -ForegroundColor Blue
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host ""

$iconResult = & "$ScriptDir\apply_icon_assets.ps1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Icon assets applied successfully" -ForegroundColor Green
} else {
    Write-Host "Icon assets application failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

# Step 4: Copy extension to resources
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host "Step 4/4: Copying Extension to Resources" -ForegroundColor Blue
Write-Host "───────────────────────────────────────" -ForegroundColor Blue
Write-Host ""

$extResult = & "$ScriptDir\copy_extension_to_resources.ps1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Extension copied successfully" -ForegroundColor Green
} else {
    Write-Host "Extension copy failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All steps completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Build Chromium: autoninja -C out\fast chrome"
Write-Host "  2. Run Whisp: out\fast\chrome.exe"
