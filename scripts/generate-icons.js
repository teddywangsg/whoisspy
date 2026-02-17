const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function createPNG(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🕵️', size / 2, size * 0.4);
  
  ctx.font = `bold ${size * 0.2}px Arial`;
  ctx.fillStyle = 'white';
  ctx.fillText('卧底', size / 2, size * 0.65);
  
  return canvas.toBuffer('image/png');
}

sizes.forEach(size => {
  const buffer = createPNG(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), buffer);
  console.log(`Created icon-${size}x${size}.png`);
});