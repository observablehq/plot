import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = d3.sort(await d3.csv("data/alphabet.csv", d3.autoType), d => d.letter);
  const m = d3.max(alphabet, d => d.frequency) * 1.1;
  return Plot.plot({
    width: 500,
    height: 250,
    inset: 10,
    x: {axis: null},
    y: {axis: null},
    marks: [
      Plot.ruleY([0], {strokeOpacity: 0.2}),
      Plot.link(alphabet, {
        x1: 0,
        y1: 0,
        x2: (d, i) => -Math.cos((0.5 + i) * Math.PI / 26) * d.frequency / m,
        y2: (d, i) => Math.sin((0.5 + i) * Math.PI / 26) * d.frequency / m,
        strokeWidth: 2
      }),
      Plot.text(alphabet, {
        x: (d, i) => -Math.cos((0.5 + i) * Math.PI / 26),
        y: (d, i) => Math.sin((0.5 + i) * Math.PI / 26),
        text: d => `${d.letter}\n${(d.frequency * 100).toFixed(1)}%`,
        lineHeight: 1.2,
        fontSize: 8,
        rotate: (d, i) => -90 + (0.5 + i) * 180 / 26
      })
    ]
  });
}
