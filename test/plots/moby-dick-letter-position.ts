import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function mobyDickLetterPosition() {
  // First compute a set of “words” from the text. As with any natural language
  // task, this is messy and approximate.
  const words = (await d3.text("data/moby-dick-chapter-1.txt"))
    .replace(/’/g, "") // remove apostrophes
    .split(/\b/g) // split at word boundaries
    .map((word) => word.replace(/[^a-z]+/gi, "")) // strip non-letters
    .filter((word) => word) // ignore (now) empty words
    .map((word) => word.toUpperCase()); // normalize to upper case

  // Then given the words, compute an array of [position, character] tuples for
  // each character in the input. A zero position indicates that it’s the first
  // letter of the word, a one position the second letter, and so on.
  const positions = words.flatMap((word) => [...word].map((c, i) => [i, c])); // compute position

  return Plot.plot({
    height: 640,
    padding: 0,
    align: 0,
    x: {
      label: "Position within word",
      axis: "top"
    },
    color: {
      scheme: "blues"
    },
    marks: [Plot.cell(positions, Plot.group({fill: "count"}, {inset: 0.5}))]
  });
}
