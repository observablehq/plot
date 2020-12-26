import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.groupX([...mobydick]
        .filter(c => /[a-z]/i.test(c))
        .map(c => c.toUpperCase())),
      Plot.ruleY([0])
    ]
  });
}
