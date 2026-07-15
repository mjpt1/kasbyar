# KesbYar local quality gate — mirrors CI verify subset (no build).
# Usage: .\scripts\verify-quality.ps1
# Full CI: npm run ci

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "KesbYar verify: generate + lint + typecheck + test" -ForegroundColor Cyan

npm run db:generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "verify OK — run 'npm run ci' before release cuts" -ForegroundColor Green
