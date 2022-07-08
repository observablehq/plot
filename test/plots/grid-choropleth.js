import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const [grid, data] = await Promise.all([
    await d3.csv("data/us-state-grid.csv", d3.autoType).then(gridmap),
    await d3.csv("data/us-state-population-2010-2019.csv", d3.autoType)
  ]);
  const states = data.filter((d) => grid.has(d.State)).map((d) => ({...d, ...grid.get(d.State)}));
  return Plot.plot({
    height: 420,
    x: {
      axis: null
    },
    y: {
      axis: null
    },
    color: {
      type: "diverging-log",
      scheme: "piyg"
    },
    marks: [
      Plot.cell(states, {x: "x", y: "y", fill: change}),
      Plot.text(states, {x: "x", y: "y", text: "key", dy: -6}),
      Plot.text(states, {
        x: "x",
        y: "y",
        text: (
          (f) => (d) =>
            f(change(d) - 1)
        )(d3.format("+.0%")),
        dy: 6,
        fillOpacity: 0.6
      })
    ]
  });
}

function gridmap(states) {
  return new Map(states.map((state) => [state.name, state]));
}

function change(d) {
  return d["2019"] / d["2010"];
}
