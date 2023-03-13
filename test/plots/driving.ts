import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function driving() {
  const driving = await d3.csv<any>("data/driving.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    grid: true,
    x: {
      label: "Miles driven (per person-year) →"
    },
    y: {
      label: "↑ Cost of gasoline ($ per gallon)"
    },
    marks: [
      Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom", markerMid: "arrow"}),
      Plot.text(driving, {filter: (d) => d.year % 5 === 0, x: "miles", y: "gas", text: (d) => `${d.year}`, dy: -12})
    ]
  });
}
