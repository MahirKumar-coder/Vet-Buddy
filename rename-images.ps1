# Rename images to match JSON paths
# Changes: UPPERCASE to lowercase, spaces to hyphens, .jpeg kept as .jpeg

$folderPath = "d:\Business\Vet-Buddy\public\products"

# Get all jpeg files
$files = Get-ChildItem -Path $folderPath -Filter "*.jpeg"

foreach ($file in $files) {
    # Skip WhatsApp images (unwanted files)
    if ($file.Name -like "WhatsApp*") {
        Write-Host "Skipping: $($file.Name)"
        continue
    }

    # Convert to lowercase and replace spaces with hyphens
    $newName = $file.Name.ToLower() -replace " ", "-"
    
    if ($newName -ne $file.Name) {
        $oldPath = $file.FullName
        $newPath = Join-Path -Path $folderPath -ChildPath $newName
        
        Rename-Item -Path $oldPath -NewName $newName -Force
        Write-Host "Renamed: $($file.Name) → $newName"
    }
}

Write-Host "`nRename complete!"
