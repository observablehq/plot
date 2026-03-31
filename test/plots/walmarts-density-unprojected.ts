import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function walmartsDensityUnprojected() {
  const walmarts = await d3.tsv<any>("data/walmarts.tsv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 600,
    grid: true,
    color: {
      scheme: "blues"
    },
    marks: [
      Plot.density(walmarts, {x: "longitude", y: "latitude", bandwidth: 12, fill: "density"}),
      Plot.geo({type: "MultiPoint", coordinates: walmarts.map((d) => [d.longitude, d.latitude])})
    ]
  });
}
