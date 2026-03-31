import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function mobyDick() {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  return Plot.plot({
    height: 1200,
    marks: [Plot.text([mobydick], {fontSize: 14, lineWidth: 40, lineHeight: 1.2, frameAnchor: "top-left"})]
  });
}
