const fs = require('fs');
const path = require('path');

function getThemes() {
  const themesPath = path.join(__dirname, '..', 'assets/theme');
  try {
    // 读取 theme 目录
    const themes = fs
      .readdirSync(themesPath)
      .filter((file) => fs.statSync(path.join(themesPath, file)).isDirectory())
      // 排除以 . 开头的隐藏目录
      .filter((dir) => !dir.startsWith('.'))
      // 排除 common 目录
      .filter((dir) => dir !== 'common');

    return themes;
  } catch (error) {
    console.error('读取主题目录失败:', error);
    return [];
  }
}

module.exports = { getThemes };
