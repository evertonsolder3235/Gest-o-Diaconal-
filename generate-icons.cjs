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

function generatePngIcon(size) {
  const width = size;
  const height = size;

  const rawData = Buffer.alloc(height * (width * 4 + 1));

  const bgR = 15, bgG = 23, bgB = 42; // #0f172a
  const cardR = 37, cardG = 99, cardB = 235; // #2563eb
  const fgR = 255, fgG = 255, fgB = 255; // White

  const margin = Math.floor(size * 0.1);
  const cornerRadius = Math.floor(size * 0.2);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const cx = Math.max(margin + cornerRadius, Math.min(size - margin - cornerRadius, x));
      const cy = Math.max(margin + cornerRadius, Math.min(size - margin - cornerRadius, y));
      const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      const isCard = (x >= margin && x < size - margin && y >= margin && y < size - margin && distSq <= cornerRadius * cornerRadius);

      const centerX = size / 2;
      const centerY = size / 2;
      const barThick = Math.floor(size * 0.07);
      const vertHalfLength = Math.floor(size * 0.26);
      const horizHalfLength = Math.floor(size * 0.18);
      const horizOffsetY = Math.floor(size * 0.06);

      const isVertBar = (Math.abs(x - centerX) <= barThick) && (y >= centerY - vertHalfLength && y <= centerY + vertHalfLength);
      const isHorizBar = (Math.abs(y - (centerY - horizOffsetY)) <= barThick) && (x >= centerX - horizHalfLength && x <= centerX + horizHalfLength);
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

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generatePngIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generatePngIcon(512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePngIcon(180));
console.log('Generated PNG icons successfully!');
