import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function randomBinsXY() {
  const random = d3.randomNormal.source(d3.randomLcg(42))(10, 3);
  const data = Array.from({length: 500}, () => [random(), random()]);
  return Plot.dot(data, Plot.bin()).plot();
}
