import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function mobyDickLetterPairs() {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  const letters = [...mobydick].map((d) => (/\w/.test(d) ? d.toUpperCase() : "*"));
  const pairs = d3.pairs(letters).map(([letter, next]) => ({letter, next}));
  return Plot.plot({
    x: {axis: null},
    y: {label: null},
    marks: [
      Plot.barX(pairs, Plot.groupY({x: "distinct"}, {x: "next", y: "letter"})),
      Plot.text(
        pairs,
        Plot.stackX(
          Plot.group(
            {
              text: "first",
              y: "first",
              x: "distinct"
            },
            {
              y: "letter",
              z: "next",
              x: "next",
              text: "next",
              fill: "white"
            }
          )
        )
      )
    ]
  });
}
