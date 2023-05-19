import * as Plot from "@observablehq/plot";

export async function colorSnow() {
  return Plot.plot({
    color: {
      domain: ["sun", "fog", "drizzle", "rain", "snow"],
      range: ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
    },
    marks: [Plot.dot(["snow"], {fill: Plot.identity, x: Plot.identity, r: 10, frameAnchor: "middle"})]
  });
}
