import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function sparseTitle() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(olympians, {
        x: "weight",
        y: "height",
        fy: "sex",
        sort: (d) => !!d.info,
        fill: (d) => (d.info ? "currentColor" : "#aaa"),
        stroke: "white",
        strokeWidth: 0.25,
        title: (d) => (d.info ? [(d.name, d.info)].join("\n\n") : undefined)
      })
    ]
  });
}

export async function sparseTitleTip() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(olympians, {
        x: "weight",
        y: "height",
        fy: "sex",
        sort: (d) => !!d.info,
        stroke: (d) => (d.info ? "currentColor" : "#aaa")
      }),
      Plot.tip(
        olympians,
        Plot.pointer({
          x: "weight",
          y: "height",
          fy: "sex",
          title: (d) => (d.info ? [(d.name, d.info)].join("\n\n") : undefined)
        })
      )
    ]
  });
}
