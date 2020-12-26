import * as Plot from "@observablehq/plot";
import {text} from "d3-fetch";

export default async function() {
  const mobydick = await text("data/moby-dick-chapter-1.txt");
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
