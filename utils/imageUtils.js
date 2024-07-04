const path = require('path');
const fs = require('fs');
const mimeType = require('mime-types');
const sizeOf = require('image-size');

const themePath = path.resolve(__dirname, '../assets/theme');

const themeList = {};

fs.readdirSync(themePath).forEach((theme) => {
  if (!(theme in themeList)) themeList[theme] = {};
  const imgList = fs.readdirSync(path.resolve(themePath, theme));
  imgList.forEach((img) => {
    const imgPath = path.resolve(themePath, theme, img);
    const name = path.parse(img).name;
    const { width, height } = sizeOf(imgPath);

    themeList[theme][name] = {
      width,
      height,
      data: convertToDatauri(imgPath),
    };
  });
});

function convertToDatauri(filePath) {
  const mime = mimeType.lookup(filePath);
  const base64 = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${base64}`;
}

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

const createImageCanvas = async (filePaths) => {
  const svg = getSvgImage(filePaths);
  return svg;
};

// 新增生成SVG的方法
function getSvgImage(filePaths) {
  if (filePaths != '' && !Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }
  let x = 0,
    y = 0;
  const parts = filePaths.map((item) => {
    const { width, height } = sizeOf(item);
    const data = convertToDatauri(item);

    const image = `${item}
      <image x="${x}" y="0" width="${width}" height="${height}" xlink:href="${data}" />`;

    x += width;
    if (height > y) y = height;

    return image;
  }, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${x}" height="${y}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="image-rendering: pixelated;">
    <title>Moe Count</title>
    <g>
      ${parts}
    </g>
</svg>
  `;
}

module.exports = {
  getImageFile,
  createImageCanvas,
  getSvgImage,
};
