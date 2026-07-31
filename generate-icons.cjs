const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

/**
 * Generates PNG icon buffer
 * @param {number} size - Width/Height
 * @param {boolean} isMaskable - If true, fills 100% background and keeps emblem within 60% safe zone
 */
function generatePngIcon(size, isMaskable = false) {
  const width = size;
  const height = size;

  const rawData = Buffer.alloc(height * (width * 4 + 1));

  const bgR = 15, bgG = 23, bgB = 42; // #0f172a
  const cardR = 37, cardG = 99, cardB = 235; // #2563eb
  const fgR = 255, fgG = 255, fgB = 255; // White

  // Safe zone scaling
  const emblemScale = isMaskable ? 0.65 : 0.82;
  const margin = Math.floor(size * ((1 - emblemScale) / 2));
  const cardWidth = size - (margin * 2);
  const cornerRadius = Math.floor(cardWidth * 0.22);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // PNG filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Calculate inner rounded emblem card
      const cx = Math.max(margin + cornerRadius, Math.min(size - margin - cornerRadius, x));
      const cy = Math.max(margin + cornerRadius, Math.min(size - margin - cornerRadius, y));
      const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      const isCard = (x >= margin && x < size - margin && y >= margin && y < size - margin && distSq <= cornerRadius * cornerRadius);

      // Cross emblem centered inside the card
      const centerX = size / 2;
      const centerY = size / 2;
      const barThick = Math.floor(cardWidth * 0.16);
      const vertHalfLength = Math.floor(cardWidth * 0.32);
      const horizHalfLength = Math.floor(cardWidth * 0.22);
      const horizOffsetY = Math.floor(cardWidth * 0.08);

      const isVertBar = (Math.abs(x - centerX) <= barThick / 2) && (y >= centerY - vertHalfLength && y <= centerY + vertHalfLength);
      const isHorizBar = (Math.abs(y - (centerY - horizOffsetY)) <= barThick / 2) && (x >= centerX - horizHalfLength && x <= centerX + horizHalfLength);
      const isCross = isVertBar || isHorizBar;

      if (isCard && isCross) {
        rawData[pxOffset] = fgR;
        rawData[pxOffset + 1] = fgG;
        rawData[pxOffset + 2] = fgB;
        rawData[pxOffset + 3] = 255;
      } else if (isCard) {
        rawData[pxOffset] = cardR;
        rawData[pxOffset + 1] = cardG;
        rawData[pxOffset + 2] = cardB;
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write standard "any" PNG icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generatePngIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generatePngIcon(512, false));

// Write maskable PNG icons (100% background fill, emblem within safe zone)
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), generatePngIcon(192, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), generatePngIcon(512, true));

// Write Apple Touch Icon & Favicon
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePngIcon(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon-64.png'), generatePngIcon(64, false));

console.log('✅ Todos os ícones PWA (any, maskable, apple-touch-icon, favicon) foram gerados com sucesso!');
