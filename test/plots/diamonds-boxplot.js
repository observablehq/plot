import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const diamonds = await d3.csv("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.boxX(diamonds, {x: "price", y: "clarity", sort: {y: "x"}})
    ]
  });
}
