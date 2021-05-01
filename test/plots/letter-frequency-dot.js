import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(alphabet, {x: "letter", r: "frequency"})
    ]
  });
}
