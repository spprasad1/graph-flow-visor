/**
 * Build script for Network Analysis OAC Extension
 * Creates a .dva file for upload to Oracle Analytics Cloud
 */

const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Configuration
const extensionName = 'network-analysis-viz';
const outputDir = './dist';
const outputFile = `${extensionName}.dva`;

// Files to include in the extension package
const filesToInclude = [
    'manifest.json',
    'visualization.js',
    'config.js', 
    'style.css'
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create the archive
const output = fs.createWriteStream(path.join(outputDir, outputFile));
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

// Listen for archive events
output.on('close', function() {
    console.log(`✅ Extension package created: ${outputFile}`);
    console.log(`📦 Total size: ${archive.pointer()} bytes`);
    console.log(`🚀 Ready to upload to Oracle Analytics Cloud!`);
    console.log();
    console.log(`Upload Instructions:`);
    console.log(`1. Open Oracle Analytics Cloud`);
    console.log(`2. Navigate to Console → Extensions`);
    console.log(`3. Click "Upload Extension"`);
    console.log(`4. Select the file: ${path.join(outputDir, outputFile)}`);
    console.log(`5. Enable the extension after upload`);
});

archive.on('error', function(err) {
    console.error('❌ Error creating extension package:', err);
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Validate and add files
console.log('🔨 Building OAC Extension...');
console.log();

filesToInclude.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
        console.log(`✓ Adding: ${filename}`);
        archive.file(filePath, { name: filename });
    } else {
        console.error(`❌ Missing file: ${filename}`);
        process.exit(1);
    }
});

// Validate manifest.json
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log();
    console.log('📋 Extension Details:');
    console.log(`   Name: ${manifest.displayName}`);
    console.log(`   Version: ${manifest.version}`);
    console.log(`   Author: ${manifest.author}`);
    console.log(`   Description: ${manifest.description}`);
    console.log();
    
    // Validate required fields
    const requiredFields = ['name', 'displayName', 'version', 'files', 'dataRoles'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
        console.error(`❌ Missing required manifest fields: ${missingFields.join(', ')}`);
        process.exit(1);
    }
    
    console.log('✅ Manifest validation passed');
    
} catch (error) {
    console.error('❌ Invalid manifest.json:', error.message);
    process.exit(1);
}

// Finalize the archive
archive.finalize();