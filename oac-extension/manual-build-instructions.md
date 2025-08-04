# Manual Build Instructions for Network Analysis OAC Extension

If you prefer to manually create the extension package or the build scripts don't work, follow these steps:

## Quick Manual Build

### Option 1: Using Windows Explorer
1. Select these 4 files:
   - `manifest.json`
   - `visualization.js`
   - `config.js`
   - `style.css`

2. Right-click and select "Send to → Compressed (zipped) folder"
3. Rename the zip file to: `network-analysis-viz.dva`
4. Upload to Oracle Analytics Cloud

### Option 2: Using 7-Zip (Windows)
1. Install 7-Zip if not already installed
2. Select the 4 required files
3. Right-click → 7-Zip → "Add to archive..."
4. Set archive name to: `network-analysis-viz.dva`
5. Set archive format to: ZIP
6. Click OK

### Option 3: Using Command Line (Mac/Linux)
```bash
# Navigate to the oac-extension folder
cd oac-extension

# Create the extension package
zip network-analysis-viz.dva manifest.json visualization.js config.js style.css

# The file is ready for upload!
```

### Option 4: Using PowerShell (Windows)
```powershell
# Navigate to the oac-extension folder
cd oac-extension

# Create the extension package
Compress-Archive -Path manifest.json,visualization.js,config.js,style.css -DestinationPath network-analysis-viz.dva

# The file is ready for upload!
```

## File Verification

Before uploading, ensure your package contains exactly these files:
- ✅ `manifest.json` (Extension metadata)
- ✅ `visualization.js` (Main visualization code)
- ✅ `config.js` (Configuration and properties)
- ✅ `style.css` (Styling for OAC)

## Upload to Oracle Analytics Cloud

1. **Open OAC Console**
   - Navigate to your Oracle Analytics Cloud instance
   - Go to Console → Extensions

2. **Upload Extension**
   - Click "Upload Extension" button
   - Select your `network-analysis-viz.dva` file
   - Wait for upload to complete

3. **Enable Extension**
   - Find "Network Analysis Visualization" in the extensions list
   - Toggle it to "Enabled"
   - Refresh your browser

4. **Use in Reports**
   - Create a new workbook or open existing one
   - Look for "Network Analysis Visualization" in the visualization types
   - Drag your data columns to the appropriate data roles

## Data Setup Example

Your data should look like this:

| Destination ID | Destination IP | Source IP | Port | Destination Hostname | Source Hostname |
|----------------|----------------|-----------|------|---------------------|-----------------|
| dest_001 | 192.168.1.100 | 192.168.1.10 | 80 | web-server-01 | user-pc-01 |
| dest_001 | 192.168.1.100 | 192.168.1.15 | 22 | web-server-01 | admin-workstation |
| dest_002 | 192.168.1.200 | 192.168.1.50 | 3306 | database-server | app-server-01 |

## Troubleshooting

### Extension Won't Upload
- Verify file extension is `.dva`
- Check file size (should be under 10MB)
- Ensure zip contains only the 4 required files

### Extension Won't Load
- Check browser console for JavaScript errors
- Verify OAC version compatibility (5.5.0+)
- Ensure D3.js library is available

### Visualization Not Appearing
- Check data mapping requirements
- Verify required columns are mapped
- Look for validation errors in the data

### Performance Issues
- Limit data to < 1000 connections
- Use data aggregation in OAC
- Consider filtering large datasets

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify data meets the requirements
3. Test with sample data first
4. Ensure OAC version compatibility