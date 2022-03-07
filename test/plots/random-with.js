import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const randomNormal = d3.randomNormal.source(d3.randomLcg(42))();
  return Plot.plot({
    marks: [
      Plot.lineY({length: 500}, Plot.mapY("cumsum", {y: randomNormal, stroke: "blue"})).with(Plot.dot)
    ]
  });
}
