const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

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
      const img = await loadImage(p);
      if (!img) {
        throw new Error(`Image not loaded: ${p}`);
      }
      return img;
    })
  );

  if (!images || images.length === 0 || !images[0]) {
    throw new Error('No images loaded');
  }

  const width = images[0].width;
  const height = images[0].height;
  const canvas = createCanvas(width * images.length, height);
  const ctx = canvas.getContext('2d');

  // 清空画布，确保透明背景
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制每个GIF图像到画布
  images.forEach((img, index) => {
    if (img) {
      ctx.drawImage(img, index * width, 0, width, height);
    } else {
      throw new Error(`Image at index ${index} is undefined`);
    }
  });

  return canvas;
};

module.exports = {
  getImageFile,
  getImageMimeType,
  createImageCanvas,
};
