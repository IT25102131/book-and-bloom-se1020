$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$javaExists = $false
try {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME/bin/java.exe" -ErrorAction SilentlyContinue)) {
        $javaExists = $true
    }
} catch {
    $javaExists = $false
}

if (-not $javaExists) {
    $candidates = @()
    foreach ($root in @("$env:USERPROFILE/.jdks", 'C:/Program Files/Eclipse Adoptium', 'C:/Program Files/Java')) {
        try {
            if (Test-Path $root -ErrorAction SilentlyContinue) {
                $dirs = Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue
                foreach ($d in $dirs) {
                    $exe = Join-Path $d.FullName 'bin/java.exe'
                    if (Test-Path $exe -ErrorAction SilentlyContinue) {
                        $candidates += $d
                    }
                }
            }
        } catch {}
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
