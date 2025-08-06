#!/bin/bash

echo "Building Oracle Analytics Cloud Network Analysis Extension..."
echo

# Check if required files exist
required_files=("manifest.json" "visualization.js" "config.js" "style.css")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ ERROR: Missing required files:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

# Create dist directory
mkdir -p dist

# Create the extension package
echo "Creating extension package..."
zip -r "dist/network-analysis-viz.zip" manifest.json visualization.js config.js style.css

if [ $? -eq 0 ]; then
    echo
    echo "✅ SUCCESS: Extension package created!"
    echo "📦 File: dist/network-analysis-viz.zip"
    echo
    echo "🚀 Upload Instructions:"
    echo "1. Open Oracle Analytics Cloud"
    echo "2. Navigate to Console → Extensions"
    echo "3. Click 'Upload Extension'"
    echo "4. Select: dist/network-analysis-viz.zip"
    echo "5. Enable the extension after upload"
    echo
    
    # Show file size
    size=$(du -h "dist/network-analysis-viz.zip" | cut -f1)
    echo "📊 Package size: $size"
else
    echo
    echo "❌ ERROR: Failed to create extension package"
    echo "Please ensure 'zip' command is available"
    exit 1
fi