import * as Plot from "@observablehq/plot";
import {text} from "d3-fetch";

export default async function() {
  const mobydick = await text("data/moby-dick-chapter-1.txt");

  // Compute a set of “words” from the text. As with any natural language task,
  // this is messy and approximate.
  const words = mobydick
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
      Plot.groupX(words, {x: d => d.length, normalize: true})
    ]
  });
}
