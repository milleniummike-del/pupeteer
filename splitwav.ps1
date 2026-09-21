param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,

    [int]$SegmentLength = 20
)

# Normalize path (removes accidental quotes)
$InputFile = $InputFile.Trim('"')

# Ensure ffmpeg exists
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg not found in PATH."
    exit 1
}

# Validate file exists
if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

# Build output folder
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
$outDir   = Join-Path (Split-Path $InputFile) "$baseName-segments"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Output pattern
$segmentPattern = Join-Path $outDir "${baseName}_%03d.wav"

# Run segmentation
ffmpeg -i "$InputFile" -f segment -segment_time $SegmentLength -c copy "$segmentPattern"
