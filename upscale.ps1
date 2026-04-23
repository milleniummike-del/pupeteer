const directory = require('./directory.js');
$outputDir = "$inputDir\upscaled"
const inputDir = directory.getPath();
console.log('t');
console.log(inputDir);

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$videoExtensions = @("*.mp4", "*.mkv", "*.avi", "*.mov", "*.webm")

$files = Get-ChildItem -Path $inputDir -Include $videoExtensions -Recurse

foreach ($file in $files) {
    $inputPath = $file.FullName
    $outputPath = Join-Path $outputDir $file.Name

    Write-Host "Upscaling: $inputPath"

    & "C:\Program Files\Video2X Qt6\video2x.exe" `
        -i "$inputPath" `
        -o "$outputPath" `
        -p "realesrgan" `
        -s 3
}