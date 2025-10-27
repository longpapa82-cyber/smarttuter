const fs = require('fs');
const path = require('path');

const createSVGIcon = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.125}"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" 
        dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">ST</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createSVGIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createSVGIcon(512));
fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSVGIcon(256));

console.log('✅ SVG icons created successfully!');
console.log('Files:', fs.readdirSync(publicDir).filter(f => f.includes('icon') || f.includes('favicon')));
