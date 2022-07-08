import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    symbol: {
      legend: true
    },
    marks: [Plot.dot(penguins, Plot.hexbin({r: "count"}, {symbol: "sex", x: "culmen_depth_mm", y: "culmen_length_mm"}))]
  });
}
