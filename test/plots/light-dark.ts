import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function lightDark() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "light-dark(steelblue, orange)", sort: {y: "-x"}})]
  });
});
