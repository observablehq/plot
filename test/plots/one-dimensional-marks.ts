import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// arrow
export async function oneDimensionalArrow() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [
      Plot.frame(),
      Plot.arrow(income, Plot.groupZ({x1: "first", x2: "last"}, {x1: "value", x2: "value", sort: "gender"}))
    ]
  });
}

// line
export async function oneDimensionalLine() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [Plot.frame(), Plot.line(income, {x: "value", sort: "gender", markerEnd: "arrow"})]
  });
}

// link
export async function oneDimensionalLink() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [
      Plot.frame(),
      Plot.link(
        income,
        Plot.groupZ({x1: "first", x2: "last"}, {x1: "value", x2: "value", sort: "gender", markerEnd: "arrow"})
      )
    ]
  });
}
