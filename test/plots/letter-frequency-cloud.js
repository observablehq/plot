import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  const random = d3.randomLcg(3);
  const m = d3.max(alphabet, d => d.frequency);
  const x = alphabet.map(random);
  const y = alphabet.map(random);
  return Plot.plot({
    x: { axis: null, domain: [-0.1, 1.1] },
    y: { axis: null, domain: [-0.1, 1.2] },
    marks: [
      Plot.text(alphabet, {x, y, text: "letter", fontSize: d => 10 + 200 * (d.frequency / m)})
    ]
  });
}
