const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
  const publicDir = path.join(__dirname, '..', 'public');

  try {
    // Convert 192x192 icon
    await sharp(path.join(publicDir, 'icon-192.svg'))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192-new.png'));

    fs.renameSync(
      path.join(publicDir, 'icon-192-new.png'),
      path.join(publicDir, 'icon-192.png')
    );

    // Convert 512x512 icon
    await sharp(path.join(publicDir, 'icon-512.svg'))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512-new.png'));

    fs.renameSync(
      path.join(publicDir, 'icon-512-new.png'),
      path.join(publicDir, 'icon-512.png')
    );

    // Create favicon (32x32)
    await sharp(path.join(publicDir, 'icon.svg'))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-new.png'));

    // Convert PNG to ICO (or just use PNG as favicon)
    fs.renameSync(
      path.join(publicDir, 'favicon-new.png'),
      path.join(publicDir, 'favicon.ico')
    );

    console.log('✅ PNG icons converted successfully!');

    // Verify file sizes
    const files = ['icon-192.png', 'icon-512.png', 'favicon.ico'];
    files.forEach(file => {
      const stats = fs.statSync(path.join(publicDir, file));
      console.log(`${file}: ${Math.round(stats.size / 1024)}KB`);
    });

  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

convertSVGtoPNG();
