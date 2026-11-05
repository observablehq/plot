import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function wordLengthMobyDick() {
  // Compute a set of “words” from the text. As with any natural language task,
  // this is messy and approximate.
  const words = (await d3.text("data/moby-dick-chapter-1.txt"))
    .replace(/’/g, "") // remove apostrophes
    .split(/\b/g) // split at word boundaries
    .map((word) => word.replace(/[^a-z]+/gi, "")) // strip non-letters
    .filter((word) => word); // ignore (now) empty words

  return Plot.plot({
    x: {label: "Word length", labelAnchor: "right", labelArrow: true},
    y: {grid: true, percent: true},
    marks: [Plot.barY(words, Plot.groupX({y: "proportion", title: "mode"}, {x: "length", title: (d) => d}))]
  });
});
