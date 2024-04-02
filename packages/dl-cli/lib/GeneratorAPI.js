const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const { isBinaryFile } = require("isbinaryfile");

const { toShortPluginId } = require("dl-cli-shared-utils");
const mergeDeps = require("./utils/mergeDeps");
const isString = (val) => typeof val === "string";
const isObject = (val) => val && typeof val === "object";

class GeneratorAPI {
  /**
   * Creates an instance of GeneratorAPI.
   * @param {*} id
   * @param {*} generator
   * @param {*} options
   * @param {*} rootOptions 根选项 preset
   * @memberof GeneratorAPI
   */
  constructor(id, generator, options, rootOptions) {
    this.id = id;
    this.generator = generator;
    this.options = options;
    this.rootOptions = rootOptions;
    this.pluginsData = generator.plugins
      .filter((id) => id !== "@vue/cli-service")
      .map(({ id }) => ({ name: toShortPluginId(id) }));
    // @vue/cli-plugin-eslint => {name: eslint}
  }
  /**
   *
   *
   * @param {*} source 模板目录的路径
   * @param {*} additionData 额外的数据对象
   * @memberof GeneratorAPI
   */
  render(source, additionData) {
    const baseDir = extractCallDir();
    if (isString(source)) {
      source = path.resolve(baseDir, source);
      // 此处只是暂存中间件函数，并没有执行
      this._injectFileMiddleware(async (files) => {
        const data = this._resolveData(additionData);
        let globby = require("globby");
        let _files = await globby(["**/*"], { cwd: source });
        console.log("_files: ", _files);
        for (const rawPath of _files) {
          const targetPath = rawPath
            .split("/")
            .map((field) => {
              if (field.charAt(0) === "_") {
                // _gitignore -> .gitignore
                return `.${field.slice(1)}`;
              }
              return field;
            })
            .join("/");
          // 模板文件夹里原始文件的绝对路径
          const sourcePath = path.resolve(source, rawPath);
          const content = renderFile(sourcePath, data);
          files[targetPath] = content;
        }
      });
    }
  }
  extendPackage(fields) {
    const pkg = this.generator.pkg;
    const toMerge = fields;
    for (const key in toMerge) {
      const value = toMerge[key];
      let existing = pkg[key];
      if (
        isObject(value) &&
        (key === "dependencies" || key === "devDependencies")
      ) {
        pkg[key] = mergeDeps(existing || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }
  hasPlugin(id) {
    return this.generator.hasPlugin(id);
  }
  _resolveData(additionData) {
    return Object.assign(
      {
        options: this.options,
        rootOptions: this.rootOptions,
        plugins: this.pluginsData,
      },
      additionData
    );
  }
  _injectFileMiddleware(middleware) {
    this.generator.fileMiddlewares.push(middleware);
  }
}

function extractCallDir() {
  const obj = {};
  Error.captureStackTrace(obj);
  const callSite = obj.stack.split("\n")[3];
  const namedStackRegExp = /\s\((.*):\d+:\d+\)$/;
  let matchResult = callSite.match(namedStackRegExp);
  const fileName = matchResult[1];
  return path.dirname(fileName);
}

function renderFile(name, data) {
  if (isBinaryFile(name)) {
    // 二进制文件】
    return fs.readFileSync(name);
  }
  let template = fs.readdirSync(name, "utf8");
  return ejs.render(template, data);
}

module.exports = GeneratorAPI;
