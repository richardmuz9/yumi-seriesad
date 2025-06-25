const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'config');
const destDir = path.join(__dirname, '..', 'dist', 'config');

// Create dist/config directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all JSON files from src/config to dist/config
fs.readdirSync(srcDir)
  .filter(file => file.endsWith('.json'))
  .forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${file} to dist/config/`);
  }); 