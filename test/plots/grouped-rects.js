import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    marks: [Plot.rectY({length: 10}, Plot.groupX({y: "count"}, {x: (d, i) => "ABCDEFGHIJ"[i]}))]
  });
}
