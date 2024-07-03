const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const getImageFile = async (dir, name) => {
  if (!fs.existsSync(dir)) {
    throw new Error('Directory not found');
  }

  let filePath;

  if (name) {
    // 查找符合的唯一一个图片，不区分文件后缀名大小写
    const files = fs.readdirSync(dir);
    const lowerCaseName = name.toLowerCase();
    const matchingFiles = files.filter(
      (file) => file.toLowerCase() === lowerCaseName
    );

    if (matchingFiles.length === 1) {
      filePath = path.join(dir, matchingFiles[0]);
    } else if (matchingFiles.length === 0) {
      throw new Error('No matching image found');
    } else {
      throw new Error('Multiple matching images found');
    }
  } else {
    // 随机返回一个图片
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      throw new Error('No images found');
    }
    const randomFile = files[Math.floor(Math.random() * files.length)];
    filePath = path.join(dir, randomFile);
  }

  return filePath;
};

const getImageMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.gif':
      return 'image/gif';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
};

const createImageCanvas = async (filePaths) => {
  const images = await Promise.all(
    filePaths.map(async (p) => {
      const buffer = await sharp(p).toBuffer();
      return sharp(buffer);
    })
  );

  if (!images || images.length === 0) {
    throw new Error('No images loaded');
  }

  const { width, height } = await images[0].metadata();
  const compositeImage = sharp({
    create: {
      width: width * images.length,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = images.map((img, index) => ({
    input: img.toBuffer(),
    top: 0,
    left: index * width,
  }));

  await compositeImage.composite(composites).toFile('output.png');
  return 'output.png';
};

module.exports = {
  getImageFile,
  getImageMimeType,
  createImageCanvas,
};
