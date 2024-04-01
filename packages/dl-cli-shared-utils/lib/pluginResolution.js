const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/;
exports.isPlugin = (id) => pluginRE.test(id);

exports.toShortPluginId = function (id) {
  return id.replace(pluginRE, ""); // @vue/cli-plugin-eslint => eslint
};
