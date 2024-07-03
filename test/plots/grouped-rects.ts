import * as Plot from "@observablehq/plot";

export async function groupedRects() {
  return Plot.plot({
    marks: [Plot.rectY({length: 10}, Plot.groupX({y: "count"}, {x: (d, i) => "ABCDEFGHIJ"[i]}))]
  });
}
