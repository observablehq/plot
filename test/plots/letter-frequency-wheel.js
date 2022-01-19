import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  let alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  alphabet = d3.sort(alphabet, d => d.letter);
  const m = d3.max(alphabet, d => d.frequency) * 1.1;
  return Plot.plot({
    width: 500,
    height: 250,
    x: {axis: null, inset: 10},
    y: {axis: null, inset: 10},
    marks: [
      Plot.ruleY([0], {stroke: "#ccc"}),
      Plot.link(alphabet, {
        x1: () => 0,
        y1: () => 0,
        x2: (_, i) => -Math.cos((.5 + i) * Math.PI / 26) * _.frequency / m,
        y2: (_, i) => Math.sin((.5 + i) * Math.PI / 26) * _.frequency / m,
        stroke: "black",
        strokeWidth: 2
      }),
      Plot.text(alphabet, {
        x: (_, i) => -Math.cos((.5 + i) * Math.PI / 26),
        y: (_, i) => Math.sin((.5 + i) * Math.PI / 26),
        text: "letter",
        rotate: (_, i) => -90 + (.5 + i) * 180 / 26
      }),
      Plot.text(alphabet, {
        x: (_, i) => -Math.cos((.5 + i) * Math.PI / 26),
        y: (_, i) => Math.sin((.5 + i) * Math.PI / 26),
        text: d => `\n${(d.frequency * 100).toFixed(1)}%`,
        lineAnchor: "top",
        lineHeight: 1.1,
        fontSize: 8,
        rotate: (_, i) => -90 + (.5 + i) * 180 / 26
      })
    ]
  });
}
