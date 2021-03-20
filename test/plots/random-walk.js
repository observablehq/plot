import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const randomNormal = d3.randomNormal.source(d3.randomLcg(42))();

export default async function() {
  return Plot.plot({
    marks: [
      Plot.lineY(d3.cumsum({length: 500}, randomNormal), {stroke: "red"}),
      Plot.lineY({length: 500}, Plot.mapY("cumsum", {y: randomNormal, stroke: "blue"}))
    ]
  });
}
