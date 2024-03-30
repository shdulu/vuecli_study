const fs = require("fs-extra");
const path = require("path");

module.exports = async function (dir, files) {
  Object.keys(files).forEach((name) => {
    const filePath = path.join(dir, name);
    fs.ensureDirSync(path.dirname(filePath)); // 先确保文件所在目录已存在，不存在即创建
    // 将问价内容写入文件目录
    fs.writeFileSync(filePath, files[name]);
  });
};
