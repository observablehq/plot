import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function athletesHeightWeight() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    height: 640,
    marks: [Plot.dot(athletes, {x: "weight", y: "height"})]
  });
});
