# انتشار کسب‌یار روی GitHub — در PowerShell بیرون از IDE اجرا کنید
# Usage: .\scripts\publish-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$repoUrl = "https://github.com/mjpt1/kasbyar.git"

if (-not (Test-Path .git)) {
  git init -b main
}

git add -A

$env:GIT_AUTHOR_NAME = "mjpt1"
$env:GIT_AUTHOR_EMAIL = "5987282+mjpt1@users.noreply.github.com"
$env:GIT_COMMITTER_NAME = "mjpt1"
$env:GIT_COMMITTER_EMAIL = "5987282+mjpt1@users.noreply.github.com"

$hasCommit = git rev-parse HEAD 2>$null
if (-not $hasCommit) {
  git commit -m "انتشار اولیه: سیستم‌عامل کسب‌وکار کسب‌یار"
} else {
  $status = git status --porcelain
  if ($status) {
    git commit -m "به‌روزرسانی: مستندات عملیاتی، کیفیت و آمادگی پایلوت"
  }
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  git remote add origin $repoUrl
} elseif ($remote -ne $repoUrl) {
  git remote set-url origin $repoUrl
}

git push -u origin main
Write-Host "انجام شد: https://github.com/mjpt1/kasbyar"
