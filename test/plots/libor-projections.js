import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function liborProjections() {
  const libor = await d3.csv("data/libor-projections.csv", d3.autoType);
  const pc = d3.format(".2%");
  return Plot.plot({
    width: 960,
    aspectRatio: 1,
    insetLeft: 10,
    insetRight: 5,
    insetBottom: 7,
    marks: [
      Plot.dot(libor, {x: "about", y: "on", fill: "value"}),
      Plot.text(libor, {
        x: "about",
        y: "on",
        text: (d) => pc(d.value),
        filter: (d) => d.about.getUTCMonth() === 0,
        stroke: "white",
        fill: "black"
      })
    ],
    y: {grid: true, line: true}
  });
}
