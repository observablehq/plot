import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function randomBins() {
  const random = d3.randomExponential.source(d3.randomLcg(42))(1);
  const data = Array.from({length: 100}, random);
  return Plot.rectY(data, Plot.binX()).plot();
});
