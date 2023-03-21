import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function reducerScaleOverrideFunction() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const reduce: Plot.ReducerFunction = (values) => d3.mode(values);
  return Plot.barY(
    penguins,
    Plot.groupX(
      {y: "count", fill: {reduce, scale: true}},
      {x: "species", fill: (d) => (d.island === "Biscoe" ? "orange" : "green"), fy: "sex"}
    )
  ).plot();
}

export async function reducerScaleOverrideImplementation() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const reduce: Plot.ReducerImplementation = {reduce: (index, values) => d3.mode(index, (i) => values[i])};
  return Plot.barY(
    penguins,
    Plot.groupX(
      {y: "count", fill: {reduce, scale: true}},
      {x: "species", fill: (d) => (d.island === "Biscoe" ? "orange" : "green"), fy: "sex"}
    )
  ).plot();
}

export async function reducerScaleOverrideName() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const reduce: Plot.ReducerName = "mode";
  return Plot.barY(
    penguins,
    Plot.groupX(
      {y: "count", fill: {reduce, scale: true}},
      {x: "species", fill: (d) => (d.island === "Biscoe" ? "orange" : "green"), fy: "sex"}
    )
  ).plot();
}
