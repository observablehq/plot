import * as Plot from "@observablehq/plot";
import {text} from "d3-fetch";

export default async function() {
  const mobydick = await text("data/moby-dick-chapter-1.txt");

  // First compute a set of “words” from the text. As with any natural language
  // task, this is messy and approximate.
  const words = mobydick
    .replace(/’/g, "") // remove apostrophes
    .split(/\b/g) // split at word boundaries
    .map(word => word.replace(/[^a-z]+/ig, "")) // strip non-letters
    .filter(word => word) // ignore (now) empty words
    .map(word => word.toUpperCase()); // normalize to upper case

  // Then given the words, compute an array of [position, character] tuples for
  // each character in the input. A zero position indicates that it’s the first
  // letter of the word, a one position the second letter, and so on.
  const positions = words
    .flatMap(word => [...word].map((c, i) => [i, c])); // compute position

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
    marks: [
      Plot.group(positions, {insetTop: 1, insetLeft: 1})
    ]
  });
}
