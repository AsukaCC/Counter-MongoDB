const express = require('express');
const Counter = require('../models/getCounter');
const path = require('path');
const fs = require('fs');
const { createImageCanvas } = require('../utils/imageUtils');

const router = express.Router();
const DIGIT_LENGTH = process.env.COUNTER_LENGTH || 6; // 配置位数

// 获取 ../assets/theme/ 目录下的第一个文件夹名作为默认类型
const getDefaultTheme = () => {
  const themeDir = path.join(__dirname, '../assets/theme');
  const subDirs = fs.readdirSync(themeDir).filter((subDir) => {
    return fs.statSync(path.join(themeDir, subDir)).isDirectory();
  });
  return subDirs.length > 0 ? subDirs[0] : null;
};

router.get('/:name', async (req, res) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const { name } = req.params;
  const { type } = req.query;
  const themeType = type || getDefaultTheme();

  if (!themeType) {
    return res.status(500).json({
      message: 'No default theme available / 没有可用的默认主题',
    });
  }

  try {
    let counter = await Counter.findOne({ name });
    if (counter) {
      counter.count += 1;
    } else {
      counter = new Counter({ name, count: 1 });
    }
    const result = await counter.save();
    const countStr = result.count.toString().padStart(DIGIT_LENGTH, '0');

    const themeDir = path.join(__dirname, `../assets/theme/${themeType}`);

    const gifPaths = [];
    for (let char of countStr) {
      const files = fs.readdirSync(themeDir);
      const matchingFile = files.find((file) => file.startsWith(char));

      if (matchingFile) {
        const gifPath = path.join(themeDir, matchingFile);
        gifPaths.push(gifPath);
      } else {
        console.error(
          `No matching file found for digit ${char} in theme ${themeType}`
        );
      }
    }
    const svg = await createImageCanvas(gifPaths);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error processing counter:', error);
    res.status(500).json({
      message: 'Error processing counter / 处理计数器时出错',
      error: error.message,
    });
  }
});

module.exports = router;
