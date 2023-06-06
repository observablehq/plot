import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function metroUnemploymentHighlight() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  const highlight = (d) => /, MI /.test(d.division);
  return Plot.plot({
    y: {
      grid: true,
      label: "Unemployment (%)"
    },
    color: {
      domain: [false, true],
      range: ["#ccc", "red"]
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(bls, {
        x: "date",
        y: "unemployment",
        z: "division",
        sort: highlight,
        stroke: highlight
      })
    ]
  });
}

export async function metroUnemploymentPointer() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "Unemployment (%)"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(bls, {
        x: "date",
        y: "unemployment",
        z: "division",
        strokeWidth: 0.5,
        strokeOpacity: 0.7
      }),
      Plot.line(
        bls,
        Plot.pointerX({
          x: "date",
          y: "unemployment",
          z: "division",
          stroke: "red"
        })
      ),
      Plot.dot(
        bls,
        Plot.pointerX({
          r: 2,
          x: "date",
          y: "unemployment",
          z: "date",
          fill: "red"
        })
      )
    ]
  });
}
