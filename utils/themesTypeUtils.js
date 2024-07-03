const fs = require('fs');
const path = require('path');

function getDirectories(srcPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(srcPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject('Unable to scan directory');
        return;
      }

      const directories = files
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
      resolve(directories);
    });
  });
}

module.exports = {
  getDirectories,
};
