import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  const letters = [...mobydick].filter(c => /[a-z]/i.test(c)).map(c => c.toUpperCase());
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.barY(letters, Plot.groupX()),
      Plot.ruleY([0])
    ]
  });
}
