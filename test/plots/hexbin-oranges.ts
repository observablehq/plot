import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function hexbinOranges() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    color: {
      scheme: "oranges"
    },
    marks: [
      Plot.frame(),
      Plot.circle(penguins, Plot.hexbin({fill: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm"}))
    ]
  });
});
