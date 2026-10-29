param(
    [Parameter(Mandatory=$true)]
    [string]$InputFolder
)

$InputFolder = $InputFolder.Trim('"')

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg not found in PATH."
    exit 1
}

if (-not (Test-Path $InputFolder)) {
    Write-Error "Folder not found: $InputFolder"
    exit 1
}

$listFile = Join-Path $InputFolder "concat.txt"
$outputFile = Join-Path $InputFolder "final.mp4"

Get-ChildItem $InputFolder -Filter "*.mp4" -File |
    Where-Object { $_.Name -ne "final.mp4" } |
    Sort-Object LastWriteTime |
    ForEach-Object {
        $filePath = $_.FullName.Replace('\','/')
        "file '$filePath'"
    } |
    Set-Content $listFile -Encoding ascii

ffmpeg -y -f concat -safe 0 -i "$listFile" -c copy "$outputFile"

Remove-Item $listFile -Force

Write-Host "Created: $outputFile"
