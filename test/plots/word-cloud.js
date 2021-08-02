import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {

  // Compute a set of “words” from the text. As with any natural language task,
  // this is messy and approximate.
  const words = Array.from(d3.rollup(
    (await d3.text("data/moby-dick-chapter-1.txt"))
      .replace(/’/g, "") // remove apostrophes
      .split(/\b/g) // split at word boundaries
      .map(word => word.replace(/[^a-z]+/ig, "")) // strip non-letters
      .filter(word => word),
    ([first]) => ({
      len: first.length,
      word: first
    }),
    word => word.length
  ).values());
  const random = d3.randomLcg(32);
  return Plot.plot({
    x: { axis: null, inset: 80 },
    y: { axis: null, inset: 30 },
    marks: [
      Plot.text(words, {
        x: random,
        y: random,
        text: "word",
        fill: "word",
        fillOpacity: 0.25,
        stroke: "word",
        strokeOpacity: 0.75,
        fontSize: d => 100 / Math.sqrt(d.len)
      })
    ]
  });
}
