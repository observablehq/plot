import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function penguinSex() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "sex"})), Plot.ruleY([0])]
  });
});
