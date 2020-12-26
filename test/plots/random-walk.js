import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const random = d3.randomLcg(42);
const randomNormal = d3.randomNormal.source(random);

export default async function() {
  return Plot.plot({
    marks: [
      Plot.lineY(d3.cumsum({length: 500}, randomNormal()))
    ]
  });
}
