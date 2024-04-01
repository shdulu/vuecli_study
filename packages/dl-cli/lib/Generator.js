const GeneratorAPI = require("./GeneratorAPI");
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
    this.rootOptions = cliService.options;
  }
  async generate() {
    console.log("开始真正生成文件和配置了");
    await this.initPlugins(); // 初始化插件
  }
  async initPlugins() {
    let { rootOptions } = this;
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin;
      // 为每个插件创建一个 GeneratorAPI 对象
      const api = new GeneratorAPI(id, options, rootOptions);
      await apply(api, options, rootOptions);
    }
  }
}

module.exports = Generator;
