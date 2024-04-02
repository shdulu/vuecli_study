module.exports = function mergeDeps(sourceDeps, depsToInject) {
  let result = Object.assign({}, sourceDeps);
  for (const depName in depsToInject) {
    result[depName] = depsToInject[depName];
  }
  return result;
};
