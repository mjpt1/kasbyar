# راه‌اندازی production روی Vercel — دیتابیس ابری + migration + seed
# Usage: .\scripts\vercel-production-setup.ps1 -DatabaseUrl "postgresql://..."

param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "1) اعمال schema روی دیتابیس ابری..."
$env:DATABASE_URL = $DatabaseUrl
npm run db:push

Write-Host "2) seed کاربران دمو (فقط برای محیط نمایش/پایلوت)..."
$env:ALLOW_SEED = "true"
npm run db:seed

Write-Host "3) ثبت DATABASE_URL در Vercel..."
$DatabaseUrl | npx vercel env add DATABASE_URL production

Write-Host "4) redeploy..."
npx vercel --prod --yes

Write-Host "تمام. ورود با demo@kesbyar.ir / demo1234 (اگر seed زده شد)"
