export const tests = {};

export const test = (plot) => {
  if (plot.name in tests) throw new Error(`duplicate test: ${plot.name}`);
  void (tests[plot.name] = plot);
};
