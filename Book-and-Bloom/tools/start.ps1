$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME/bin/java.exe")) {
    $candidates = @()
    foreach ($root in @("$env:USERPROFILE/.jdks", 'C:/Program Files/Eclipse Adoptium', 'C:/Program Files/Java')) {
        if (Test-Path $root) { $candidates += Get-ChildItem -LiteralPath $root -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'bin/java.exe') } }
    }
    $chosen = $candidates | Sort-Object Name -Descending | Select-Object -First 1
    if ($chosen) { $env:JAVA_HOME = $chosen.FullName }
}
$javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin/java.exe' } else { 'java' }
if (-not (Test-Path 'target/book-and-bloom.war')) {
    & './mvnw.cmd' package
    if ($LASTEXITCODE -ne 0) { throw 'Build failed. Read the Maven output above.' }
}
Write-Host 'Book & Bloom: http://127.0.0.1:8080' -ForegroundColor Green
Write-Host 'Keep this terminal open. Press Ctrl+C to stop.'
& $javaCommand -jar target/book-and-bloom.war
exit $LASTEXITCODE
