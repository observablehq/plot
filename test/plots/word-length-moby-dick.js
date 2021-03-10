import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {

  // Compute a set of “words” from the text. As with any natural language task,
  // this is messy and approximate.
  const words = (await d3.text("data/moby-dick-chapter-1.txt"))
    .replace(/’/g, "") // remove apostrophes
    .split(/\b/g) // split at word boundaries
    .map(word => word.replace(/[^a-z]+/ig, "")) // strip non-letters
    .filter(word => word); // ignore (now) empty words

  return Plot.plot({
    x: {
      label: "Word length →",
      labelAnchor: "right"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.barY(words, Plot.groupX({x: d => d.length, normalize: true}))
    ]
  });
}
