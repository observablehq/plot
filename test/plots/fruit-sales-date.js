import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const sales = await d3.csv("data/fruit-sales.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barY(sales, Plot.stackY({x: "date", y: "units", fill: "fruit"})),
      Plot.text(sales, Plot.stackY({x: "date", y: "units", text: "fruit" }))
    ]
  });
}
