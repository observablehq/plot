import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function fruitSalesDate() {
  const sales = await d3.csv<any>("data/fruit-sales.csv", d3.autoType);
  return Plot.plot({
    x: {
      type: "band" // treat dates as ordinal, not temporal
    },
    marks: [
      Plot.barY(sales, Plot.stackY({x: "date", y: "units", fill: "fruit"})),
      Plot.text(sales, Plot.stackY({x: "date", y: "units", text: "fruit"}))
    ]
  });
}
