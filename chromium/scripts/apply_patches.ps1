# Whisp Patches Application Script (PowerShell)
# Applies patches listed in patches.list file in order

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WhChromiumDir = Split-Path -Parent $ScriptDir
$WhRoot = Split-Path -Parent $WhChromiumDir
$PatchesListFile = Join-Path $WhChromiumDir "config/patches.list"
$ChromiumSourceDir = Join-Path $WhRoot "..\chromium\src"

# Use CHROMIUM_SRC env var if set
if ($env:CHROMIUM_SRC) {
    $ChromiumSourceDir = $env:CHROMIUM_SRC
}

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Whisp Patches Application" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Patches list: $PatchesListFile"
Write-Host "Chromium src: $ChromiumSourceDir"
Write-Host ""

if (-not (Test-Path $PatchesListFile)) {
    Write-Host "ERROR: patches.list not found at $PatchesListFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ChromiumSourceDir)) {
    Write-Host "ERROR: Chromium source directory not found at $ChromiumSourceDir" -ForegroundColor Red
    exit 1
}

Push-Location $ChromiumSourceDir

$total = 0
$applied = 0
$skipped = 0
$failed = 0

Get-Content $PatchesListFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line -match "^\s*#") {
        return
    }

    $total++
    $patchPath = Join-Path $WhChromiumDir $line

    if (-not (Test-Path $patchPath)) {
        Write-Host "[$total] Patch not found: $line" -ForegroundColor Red
        $failed++
        return
    }

    $patchName = Split-Path -Leaf $line
    Write-Host "[$total] Applying: $patchName" -ForegroundColor Blue

    # Try to apply normally
    & git apply --check $patchPath 2>$null
    if ($LASTEXITCODE -eq 0) {
        & git apply $patchPath
        Write-Host "    Applied successfully" -ForegroundColor Green
        $applied++
    } else {
        # Check if already applied
        & git apply --reverse --check $patchPath 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Already applied, skipping" -ForegroundColor Yellow
            $skipped++
        } else {
            Write-Host "    Failed to apply" -ForegroundColor Red
            Write-Host "    Running git apply with verbose output:" -ForegroundColor Yellow
            & git apply $patchPath 2>&1 | Select-Object -First 20
            $failed++

            $reply = Read-Host "Continue with remaining patches? (y/n)"
            if ($reply -notmatch "^[Yy]") {
                Write-Host "Aborted by user" -ForegroundColor Red
                exit 1
            }
        }
    }
    Write-Host ""
}

Pop-Location

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Summary" -ForegroundColor Blue
Write-Host "========================================="
Write-Host "Total patches: $total"
Write-Host "Applied: $applied" -ForegroundColor Green
Write-Host "Skipped (already applied): $skipped" -ForegroundColor Yellow
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "All patches applied successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some patches failed to apply" -ForegroundColor Red
    exit 1
}
