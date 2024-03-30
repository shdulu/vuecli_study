const path = require("path");
const Creator = require("./Creator");
const { getPromptModules } = require("./utils/createTools");
/**
 * 创建项目
 *
 * @param {*} projectName
 */
async function create(projectName) {
  debugger;
  const cwd = process.cwd(); // 当前的工作目录
  const name = projectName; // 项目名称
  const targetDir = path.join(cwd, name);

  const promptModules = getPromptModules();
  console.log("promptModules:", promptModules);
  const creator = new Creator(name, targetDir, promptModules);
  await creator.create();
}
module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log(err);
  });
};
