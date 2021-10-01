import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const randomNormal = d3.randomNormal.source(d3.randomLcg(42))();
  const randoms = Array.from({length: 300}, randomNormal);
  return Plot.plot({
    marks: [
      Plot.dotX(randoms, Plot.mapY("quantile", {y: randoms}))
    ]
  });
}
