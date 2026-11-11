$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$warPath = Join-Path $projectRoot 'target\book-and-bloom.war'
if (-not (Test-Path $warPath)) {
    throw "WAR file not found at $warPath"
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$mode = [System.IO.Compression.ZipArchiveMode]::Update
$zip = [System.IO.Compression.ZipFile]::Open($warPath, $mode)

function Update-Entry($entryPath, $sourceFilePath) {
    if (-not (Test-Path $sourceFilePath)) {
        Write-Warning "Source file not found: $sourceFilePath"
        return
    }
    $normalized = $entryPath.Replace('\', '/')
    $existing = $zip.Entries | Where-Object { $_.FullName -eq $normalized }
    if ($existing) {
        $existing.Delete()
    }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $sourceFilePath, $normalized) | Out-Null
    Write-Host "Updated entry: $normalized"
}

try {
    $cssFile = Join-Path $projectRoot 'src\main\resources\static\css\style.css'
    $jsFile = Join-Path $projectRoot 'src\main\resources\static\js\app.js'
    $jspFile = Join-Path $projectRoot 'src\main\webapp\WEB-INF\views\shell.jspf'
    $heroImg = Join-Path $projectRoot 'src\main\resources\static\images\hero-cozy-sunlit.jpg'

    Update-Entry 'WEB-INF/views/shell.jspf' $jspFile

    Update-Entry 'css/style.css' $cssFile
    Update-Entry 'static/css/style.css' $cssFile
    Update-Entry 'WEB-INF/classes/static/css/style.css' $cssFile

    Update-Entry 'js/app.js' $jsFile
    Update-Entry 'static/js/app.js' $jsFile
    Update-Entry 'WEB-INF/classes/static/js/app.js' $jsFile

    Update-Entry 'images/hero-cozy-sunlit.jpg' $heroImg
    Update-Entry 'static/images/hero-cozy-sunlit.jpg' $heroImg
    Update-Entry 'WEB-INF/classes/static/images/hero-cozy-sunlit.jpg' $heroImg

    Write-Host "ALL WAR entries updated successfully!" -ForegroundColor Green
} finally {
    $zip.Dispose()
}
