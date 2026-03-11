param (
    [Parameter(Position=0)]
    $Input1,

    [Parameter(Position=1)]
    $Input2
)

# Configuration
$prompts = @(
    'animalcomedy', 'bond', 'dance', 'dinosaurs', 'drone', 'fantasy', 
    'magiccreatures', 'music', 'nature', 'people', 'scifi', 'surreal'
)

$creators = @(
    'gentube', 'grokvideos', 'metavideos', 'sonauto'
)

# Predefined Variants
$predefined = @{
    1 = @('surreal', 'gentube')
    2 = @('drone', 'grokvideos')
    3 = @('fantasy', 'metavideos')
    4 = @('scifi', 'sonauto')
}

$Prompt = ""
$Creator = ""

# Determine Prompt and Creator
if ($Input1 -match '^\d+$') {
    $v = [int]$Input1
    if ($predefined.ContainsKey($v)) {
        $Prompt = $predefined[$v][0]
        $Creator = $predefined[$v][1]
    } else {
        Write-Error "Variant $v not defined."
        return
    }
} elseif ($Input1 -and $Input2) {
    $Prompt = $Input1
    $Creator = $Input2
} else {
    Write-Host "`nUsage:" -ForegroundColor Green
    Write-Host "  .\automate.ps1 <VariantNumber>             (e.g., .\automate.ps1 1)"
    Write-Host "  .\automate.ps1 <PromptName> <CreatorName>  (e.g., .\automate.ps1 surreal gentube)"
    
    Write-Host "`nPredefined Variants:" -ForegroundColor Cyan
    $predefined.Keys | Sort-Object | ForEach-Object {
        Write-Host "  $_ : $($predefined[$_][0]) + $($predefined[$_][1])"
    }
    
    Write-Host "`nAvailable Prompts:" -ForegroundColor Cyan
    Write-Host "  $($prompts -join ', ')"
    
    Write-Host "`nAvailable Creators:" -ForegroundColor Cyan
    Write-Host "  $($creators -join ', ')"
    return
}

$promptFile = ".\prompts_$Prompt.js"
$creatorFile = ".\create_$Creator.js"

if (Test-Path $promptFile) {
    if (Test-Path $creatorFile) {
        Write-Host "`n[1/2] Generating prompts with $promptFile..." -ForegroundColor Cyan
        node $promptFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[2/2] Launching browser with $creatorFile..." -ForegroundColor Cyan
            Write-Host "NOTE: If you don't see the browser window, check your taskbar!" -ForegroundColor Yellow
            Write-Host "The script will pause at the end to keep the browser open." -ForegroundColor Gray
            
            node $creatorFile
            
            Write-Host "`nAutomated process complete." -ForegroundColor Green
        } else {
            Write-Error "Prompt generation failed."
        }
        
        # Write-Host "`nPress any key to return to PowerShell..." -ForegroundColor Gray
        # $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Error "Creator file $creatorFile not found."
    }
} else {
    Write-Error "Prompt file $promptFile not found."
}
