const express = require('express');
const path = require('path');
const fs = require('fs');
const { getImageFile, getSvgImage } = require('../utils/imageUtils');

const router = express.Router();

const emojiDir = path.join(__dirname, '../assets/emoji');

router.get('/:name?', async (req, res) => {
  let { name } = req.params;

  try {
    if (!name) {
      // 未传入文件名参数，随机返回一个图片
      const files = fs.readdirSync(emojiDir);
      if (files.length === 0) {
        throw new Error('No images found');
      }
      const randomFile = files[Math.floor(Math.random() * files.length)];
      return res.redirect(`/api/emoji/${randomFile}`);
    }

    // 传入了文件名参数
    const filePath = await getImageFile(emojiDir, name);
    const svg = getSvgImage(filePath);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error processing emoji:', error);
    res.status(500).json({
      message: 'Error processing emoji / 处理表情时出错',
      error: error.message,
    });
  }
});

module.exports = router;
