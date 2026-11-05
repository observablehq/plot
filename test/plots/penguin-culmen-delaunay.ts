import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function penguinCulmenDelaunay() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.delaunayLink(data, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "culmen_length_mm"})]
  });
});
