const inquirer = require("inquirer");
const { chalk, execa, loadModule } = require("dl-cli-shared-utils");
const cloneDeep = require("lodash.clonedeep");
const Generator = require("./Generator");
const { defaults } = require("./options");
const writeFileTree = require("./utils/writeFileTree");
const PromptModuleAPI = require("./PromptModuleAPI");
const isManualMode = (answers) => answers.preset === "__manual__";

class Creator {
  constructor(name, context, promptModules) {
    this.name = name; // 创建的项目名称
    this.context = context; // 创建的项目目录
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    // 预设 {name: 'preset', type: 'list', choices: [React18, React19, Vue3]}
    this.presetPrompt = presetPrompt;
    // 此时的特性还是一个空数组，选完了预设之后才会有
    this.featurePrompt = featurePrompt;
    // 选择了某个特性后例如UI组件，这个特性可能会添加新的选择项 [YQBUI, RNUI]
    this.injectedPrompts = [];
    // 选择完所有的特性后的回调数组
    this.promptCompleteCbs = [];
    this.run = this.run.bind(this);
    // 初始化PromptModuleAPI 实例
    const PromptAPI = new PromptModuleAPI(this);
    // 执行promptModules插入预设和特性
    promptModules.forEach((m) => m(PromptAPI));
  }
  async create() {
    const { name, context } = this;
    // 弹出并解析预设
    let preset = await this.promptAndResolvePreset();
    // {plugins: {}, vueVersion: '3'}
    console.log("preset:", preset);
    preset = cloneDeep(preset);
    // @vue/cli-service 核心包，自带webpack配置，已经build、serve 命令
    // @vue/cli-service 非常特殊
    preset.plugins["@vue/cli-service"] = Object.assign(
      { projectName: name },
      preset
    );
    console.log(`✨  Creating project in ${chalk.yellow(context)}.`);
    // 将要生成的项目的 package.json 的内容
    const pkg = {
      name,
      version: "0.1.0",
      private: true,
      devDependencies: {},
    };
    const deps = Object.keys(preset.plugins);
    deps.forEach((dep) => {
      pkg.devDependencies[dep] = "latest"; // getVersion() -> 获取当前npm包最新版本号
    });
    // 写入package.json 文件
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2),
    });
    console.log(`🗃  Initializing git repository...`);
    await this.run("git init"); // 初始化git仓库
    console.log(
      `⚙\u{fe0f}  Installing CLI plugins. This might take a while...`
    );
    await this.run("npm install"); // 安装依赖
    console.log(`🚀  Invoking generators...`); // 调用生成器
    const plugins = await this.resolvePlugins(preset.plugins);
    console.log("plugins:", plugins);
    const generator = new Generator(context, { pkg, plugins });
    await generator.generate();
  }
  run(command, args) {
    // 在context 目录执行命令 command
    return execa(command, args, { cwd: this.context });
  }

  /**
   * 插件是按照约定规范时间
   *
   * @param {*} rawPlugins
   * @memberof Creator
   */
  async resolvePlugins(rawPlugins) {
    // ['@vue/cli-service', '@vue/cli-plugin-eslint']
    const plugins = [];
    for (const id of Object.keys(rawPlugins)) {
      // 加载context目录下的文件
      const apply = loadModule(`${id}/generator`, this.context);
      let options = rawPlugins[id];
      // id:@vue/cli-service, apply:插件的generator函数, options:插件选项
      plugins.push({ id, apply, options });
    }
    return plugins;
  }
  resolvePreset(name) {
    return this.getPresets()[name];
  }
  async promptAndResolvePreset() {
    const answers = await inquirer.prompt(this.resolveFinalPrompts());
    let preset;
    if (answers.preset && answers.preset !== "__manual__") {
      // 非手动选择模式
      preset = await this.resolvePreset(answers.preset);
    } else {
      preset = {
        plugins: {}, // 空对象表示没有任何插件
      };
      answers.features = answers.features || [];
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }
    return preset;
  }
  resolveFinalPrompts() {
    this.injectedPrompts.forEach((prompt) => {
      let originWhen = prompt.when || (() => true);
      prompt.when = (answers) => {
        // 如果是手动模式，且 answers 里由vueVersion特性才弹出来
        return isManualMode(answers) && originWhen(answers);
      };
    });
    const prompts = [
      this.presetPrompt, // 先选预设 default vue2 vue3 manual
      this.featurePrompt, // 再选特性 feature
      ...this.injectedPrompts, // 不同的promptModule 插入的选项
    ];
    console.log("prompts:", prompts);
    return prompts;
  }
  getPresets() {
    return Object.assign({}, defaults);
  }
  resolveIntroPrompts() {
    const presets = this.getPresets();
    const presetChoices = Object.entries(presets).map(([name]) => {
      let displayName = name;
      if (name === "default") {
        displayName = "Default (Vue 2)";
      } else if (name === "__default_vue_3__") {
        displayName = "Default (Vue 3)";
      }
      return {
        name: `${displayName}`,
        value: name,
      };
    });
    const presetPrompt = {
      name: "preset",
      type: "list",
      message: "Please pick a preset:",
      choices: [
        ...presetChoices,
        {
          name: "Manually select features", // 手动选择特性
          value: "__manual__",
        },
      ],
    };
    const featurePrompt = {
      name: "feature", // 弹出项的名称
      when: isManualMode,
      type: "checkbox",
      message: "Check the feature needed for your project:",
      choices: [],
    };
    return { presetPrompt, featurePrompt };
  }
}

module.exports = Creator;
