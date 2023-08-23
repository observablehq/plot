import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function curves() {
  const random = d3.randomLcg(42);
  const values = d3.ticks(0, 1, 11).map((t) => {
    const r = 1 + 2 * random();
    return [r * Math.cos(t * 2 * Math.PI), r * Math.sin(t * 2 * Math.PI)];
  });
  return Plot.plot({
    width: 500,
    axis: null,
    aspectRatio: true,
    inset: 10,
    marks: [
      d3
        .ticks(0, 1, 4)
        .map((tension) => [
          Plot.line(values, {curve: "bundle", tension, stroke: "red", mixBlendMode: "multiply"}),
          Plot.line(values, {curve: "cardinal-closed", tension, stroke: "green", mixBlendMode: "multiply"}),
          Plot.line(values, {curve: "catmull-rom-closed", tension, stroke: "blue", mixBlendMode: "multiply"})
        ]),
      Plot.dot(values, {stroke: "white", fill: "black"})
    ]
  });
}
