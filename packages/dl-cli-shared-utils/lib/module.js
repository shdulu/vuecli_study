const Module = require("module");
const path = require("path");

// request -> @vue/cli-service/generator
// context -> 业务项目目录

exports.loadModule = function (request, context) {
  // 创建一个require方法加载request
  // 主要目的用来加载业务代码中的文件
  return Module.createRequire(path.resolve(context, "package.json"))(request);
};
