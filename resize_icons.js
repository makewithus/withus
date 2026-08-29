const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImagePath = path.join(__dirname, 'apps', 'web', 'public', 'logo.png');
const outputDir = path.join(__dirname, 'apps', 'extension', 'icons');

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

async function generateIcons() {
    // 1. Trim the original logo to get the tightest bounding box of the actual logo text/star
    const trimmedLogoBuffer = await sharp(inputImagePath).trim().toBuffer();
    
    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon${size}.png`);
        
        // The logo should occupy about 80% of the width of the rounded square
        const logoWidth = Math.floor(size * 0.8);
        const logoHeight = Math.floor(size * 0.8);
        
        const resizedLogoBuffer = await sharp(trimmedLogoBuffer)
            .resize({
                width: logoWidth,
                height: logoHeight,
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 } // solid white padding
            })
            .toBuffer();

        // 3. Create a white rounded rectangle background
        const borderRadius = Math.floor(size * 0.2); // 20% border radius
        const roundedRectSvg = Buffer.from(
            `<svg width="${size}" height="${size}">
                <rect x="0" y="0" width="${size}" height="${size}" rx="${borderRadius}" ry="${borderRadius}" fill="#ffffff"/>
            </svg>`
        );

        // 4. Composite the logo on top of the white rounded background
        await sharp(roundedRectSvg)
            .composite([
                { input: resizedLogoBuffer, gravity: 'center' }
            ])
            .png()
            .toFile(outputPath);
            
        console.log(`Generated premium ${outputPath}`);
    }
}

generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
});
