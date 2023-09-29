import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function pointerLinkedRectInterval() {
  const a = d3.range(10).map((i) => ({series: "A", time: i, value: 15 + i - 0.3 * (i * i)}));
  const b = d3.range(12).map((i) => ({series: "B", time: i, value: 12 * i - i * i}));
  const round = {floor: (x) => Math.floor(x) - 0.5, offset: (x) => x + 1};
  const series = [...a, ...b];
  return Plot.plot({
    marks: [
      Plot.rect(series, Plot.pointerX({x: "time", interval: round, fillOpacity: 0.1})),
      Plot.lineY(series, {stroke: "series", x: "time", y: "value", marker: true, curve: "natural"}),
      Plot.arrow(series, Plot.pointerX(Plot.groupX({y1: "min", y2: "max"}, {x: "time", y: "value", inset: 10})))
    ]
  });
}
