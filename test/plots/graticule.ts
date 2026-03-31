import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function graticule() {
  return Plot.plot({
    width: 960,
    height: 470,
    projection: {
      type: "equal-earth",
      rotate: [20, 40, 60]
    },
    marks: [Plot.sphere(), Plot.graticule()]
  });
}
