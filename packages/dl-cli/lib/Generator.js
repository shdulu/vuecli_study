const { isPlugin } = require("dl-cli-shared-utils");
class Generator {
  /**
   * Creates an instance of Generator.
   * @param {*} context 项目目录
   * @param {*} {pkg, plugins}
   * @memberof Generator
   */
  constructor(context, { pkg, plugins }) {
    this.context = context;
    this.plugins = plugins;
    // 生成器会把所有要生成的文件和文件内容放在files对象
    this.files = {};

    // 生成文件的中间件，每个插件都会向中间件里插入中间件
    // 然后中间件会负责往this.files里写文件
    this.fileMiddlewares = [];
    this.pkg = pkg;
    this.allPluginIds = Object.keys(this.pkg.dependencies || {})
      .concat(this.pkg.devDependencies || {})
      .filter(isPlugin);
    const cliService = plugins.find((p) => p.id === "@vue/cli-service");

    // cliService的配置对象就是preset，也就是根配置
    this.rootOptions - cliService.options;
  }
  async generate() {}
}

module.exports = Generator;
