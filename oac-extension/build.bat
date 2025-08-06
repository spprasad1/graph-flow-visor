@echo off
echo Building Oracle Analytics Cloud Network Analysis Extension...
echo.

:: Check if files exist
if not exist "manifest.json" (
    echo ERROR: manifest.json not found!
    pause
    exit /b 1
)

if not exist "visualization.js" (
    echo ERROR: visualization.js not found!
    pause
    exit /b 1
)

if not exist "config.js" (
    echo ERROR: config.js not found!
    pause
    exit /b 1
)

if not exist "style.css" (
    echo ERROR: style.css not found!
    pause
    exit /b 1
)

:: Create dist directory
if not exist "dist" mkdir dist

:: Create the extension package
echo Creating extension package...
powershell -command "Compress-Archive -Path 'manifest.json','visualization.js','config.js','style.css' -DestinationPath 'dist\network-analysis-viz.zip' -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS: Extension package created!
    echo 📦 File: dist\network-analysis-viz.zip
    echo.
    echo 🚀 Upload Instructions:
    echo 1. Open Oracle Analytics Cloud
    echo 2. Navigate to Console → Extensions  
    echo 3. Click "Upload Extension"
    echo 4. Select: dist\network-analysis-viz.zip
    echo 5. Enable the extension after upload
    echo.
) else (
    echo.
    echo ❌ ERROR: Failed to create extension package
    echo Please ensure PowerShell is available
)

pause