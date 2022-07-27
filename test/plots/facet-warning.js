import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    facet: {
      data: AAPL.filter((d) => d.Close > 0),
      y: (d) => d3.utcFormat("%Y")(+d.Date)
    },
    y: {
      grid: true
    },
    marks: [
      Plot.line(
        AAPL.filter((d) => d.Close > 0),
        {x: "Date", y: "Close", strokeWidth: 1}
      )
    ]
  });
}
