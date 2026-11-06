param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

Write-Host "Configuring remote origin: $RepoUrl" -ForegroundColor Cyan
$existingRemote = git remote
if ($existingRemote -contains "origin") {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}

Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`nPushing all 6 member branches to GitHub..." -ForegroundColor Green
git push --all origin

Write-Host "`n========================================================" -ForegroundColor Yellow
Write-Host "  SUCCESS: All 6 member branches pushed to GitHub!" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "1. main (Base project)"
Write-Host "2. feature/user-management-IT25102131"
Write-Host "3. feature/book-management-IT25102114"
Write-Host "4. feature/order-management-IT25102130"
Write-Host "5. feature/author-management-IT25101966"
Write-Host "6. feature/category-management-IT25102132"
Write-Host "7. feature/review-management-IT25102519"
