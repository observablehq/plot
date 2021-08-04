import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const random = d3.randomLcg(32);

  // Compute a set of “words” from the text. As with any natural language task,
  // this is messy and approximate.
  const words = (await d3.text("data/moby-dick-chapter-1.txt"))
    .replace(/’/g, "") // remove apostrophes
    .split(/\b/g) // split at word boundaries
    .map(word => word.replace(/[^a-z]+/ig, "")) // strip non-letters
    .filter(word => word) // ignore non-letter words
    .map(word => word.toLowerCase()); // normalize to lowercase

  return Plot.plot({
    inset: 20,
    x: {axis: null},
    y: {axis: null},
    marks: [
      Plot.text(words, Plot.groupZ({
        text: d => d.length > 1 ? `${d[0]} (${d.length})` : "",
        fontSize: d => 4 * Math.sqrt(d.length)
      }, {
        x: random,
        y: random,
        z: d => d
      }))
    ]
  });
}
