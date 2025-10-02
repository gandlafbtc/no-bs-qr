import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the icon sizes we need
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Path to the SVG file
const svgPath = path.join(__dirname, 'src/lib/assets/favicon.svg');

// Generate icons for each size
async function generateIcons() {
  try {
    // Make sure the output directory exists
    const outputDir = path.join(__dirname, 'static/icons');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process each size
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated: icon-${size}x${size}.png`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
