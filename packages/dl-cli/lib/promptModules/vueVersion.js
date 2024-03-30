module.exports = (cli) => {
  // 插入新的特性
  cli.injectFeature({
    name: "Choose Vue version",
    value: "vueVersion",
    description:
      "Choose a version of Vue.js that you want to start the project with",
    checked: true,
  });
  // 插入新的提示选项
  cli.injectPrompt({
    name: "vueVersion",
    message:
      "Choose a version of Vue.js that you want to start the project with",
    type: "list",
    choices: [
      {
        name: "3.x",
        value: "3",
      },
      {
        name: "2.x",
        value: "2",
      },
    ],
    default: "3",
  });

  // 选完提示框的回调
  cli.onPromptComplete((answers, options) => {
    // 如果是手动配置的话，默认是没有插件的
    // 手动选择的插件都是在不同的 promptModules 里通过 用户回答调用onPromptComplete添加进去的
    if (answers.vueVersion) {
      options.vueVersion = answers.vueVersion;
    }
  });
};
