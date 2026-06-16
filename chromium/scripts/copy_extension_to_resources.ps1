# Whisp Extension Copy Script (PowerShell)
# Copies the built extension to Chromium resources directory

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WhChromiumDir = Split-Path -Parent $ScriptDir
$WhRoot = Split-Path -Parent $WhChromiumDir
$ChromiumSourceDir = if ($env:CHROMIUM_SRC) { $env:CHROMIUM_SRC } else { Join-Path $WhRoot "..\chromium\src" }
$ExtensionDistDir = Join-Path $WhRoot "chromium-extension\dist"
$ExtensionResourcesDir = Join-Path $ChromiumSourceDir "chrome\browser\resources\whisp_assistant"

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Copying Whisp Extension to Resources" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Extension source: $ExtensionDistDir"
Write-Host "Resources destination: $ExtensionResourcesDir"
Write-Host ""

if (-not (Test-Path $ChromiumSourceDir)) {
    Write-Host "ERROR: Chromium source directory not found at $ChromiumSourceDir" -ForegroundColor Red
    Write-Host "Set CHROMIUM_SRC environment variable or run from correct location"
    exit 1
}

if (-not (Test-Path $ExtensionDistDir)) {
    Write-Host "ERROR: Extension dist directory not found at $ExtensionDistDir" -ForegroundColor Red
    Write-Host "Make sure to build the extension first (e.g., pnpm build)"
    exit 1
}

# Remove existing resources
if (Test-Path $ExtensionResourcesDir) {
    Write-Host "Removing existing resources at $ExtensionResourcesDir"
    Remove-Item -Recurse -Force $ExtensionResourcesDir
}

# Create destination
Write-Host "Creating destination directory..."
New-Item -ItemType Directory -Force -Path $ExtensionResourcesDir | Out-Null

# Copy files
Write-Host "Copying extension files..."
Copy-Item -Path "$ExtensionDistDir\*" -Destination $ExtensionResourcesDir -Recurse -Force

# Verify
if (Test-Path (Join-Path $ExtensionResourcesDir "manifest.json")) {
    Write-Host "manifest.json found" -ForegroundColor Green
} else {
    Write-Host "WARNING: manifest.json not found in destination" -ForegroundColor Yellow
    exit 1
}

# Add extension key to manifest.json
Write-Host "Adding extension key to manifest.json..."
$ManifestPath = Join-Path $ExtensionResourcesDir "manifest.json"
$ExtensionKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnk6aCCanZ8kXgeZ9DjCSi8m2IhWn+CVGfw9Rm/kGdjGnJrdCCsNi7CwNPqwkC6vW+yRGc1NrBzTTeLzToIeH6p+scCp0zg5iTiOL+xBq1KtyyMGdtH6tb1GvXGud3RwD/GGkmhFsWlRtxzVzyz7NtDBhXlDDDLw/OgDi/DQGYsBfClSSvL1gNToeML+sWiRhBDhUJ+GIRRpOvDCBCXOQXTTwDWiEPFcsmfU2H/nRlWZtfqz8mMPU5ISDTR68dnLc4JhxsegrcQcV9nVxZlUjKXsdR/gdFf3DWCrJQkYwspYyg8MEzqxtRaC/G9RCP88jaBGjf9RFzkB497CpgN5+ywIDAQAB"

try {
    $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    $manifest | Add-Member -MemberType NoteProperty -Name "key" -Value $ExtensionKey -Force
    $manifest | ConvertTo-Json -Depth 10 | Set-Content $ManifestPath
    Write-Host "Extension key added to manifest.json" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to add key to manifest.json: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Extension copied successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files copied to: $ExtensionResourcesDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Rebuild Chromium to include the updated extension"
Write-Host "  2. The extension will be available as a built-in resource"
