const inquirer = require("inquirer");
const { defaults } = require("./options");
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
    // 初始化PromptModuleAPI 实例
    const PromptAPI = new PromptModuleAPI(this);
    // 执行promptModules插入预设和特性
    promptModules.forEach((m) => m(PromptAPI));
  }
  async create() {
    // 弹出并解析预设
    const answers = await this.promptAndResolvePreset();
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
        plugins: {},
      };
      answers.features = answers.features || [];
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }
    console.log("preset:", preset);
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
