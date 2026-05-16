# ShelfSense Folder Reorganizer
# Run this script inside the ShelfSense project folder

Write-Host "Starting ShelfSense folder reorganization..." -ForegroundColor Cyan

# Step 1: Create main folders
Write-Host "`n[1/3] Creating main folders..." -ForegroundColor Yellow
New-Item -ItemType Directory -Name "Frontend" -Force
New-Item -ItemType Directory -Name "Backend" -Force
Write-Host "     Created: Frontend, Backend" -ForegroundColor Green

# Step 2: Move Frontend files
Write-Host "`n[2/3] Moving Frontend files..." -ForegroundColor Yellow
Move-Item -Path "wwwroot" -Destination "Frontend\wwwroot" -Force
Write-Host "     Moved: wwwroot -> Frontend\wwwroot" -ForegroundColor Green

# Step 3: Move Backend files
Write-Host "`n[3/3] Moving Backend files..." -ForegroundColor Yellow
Move-Item -Path "Controller" -Destination "Backend\Controller" -Force
Write-Host "     Moved: Controller -> Backend\Controller" -ForegroundColor Green
Move-Item -Path "Services" -Destination "Backend\Services" -Force
Write-Host "     Moved: Services -> Backend\Services" -ForegroundColor Green
Move-Item -Path "Database" -Destination "Backend\Database" -Force
Write-Host "     Moved: Database -> Backend\Database" -ForegroundColor Green

Write-Host "`nDone! Your project has been reorganized successfully." -ForegroundColor Cyan
