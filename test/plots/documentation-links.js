import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.json("data/plot-documentation.json").then((d) => d.listings);
  return Plot.plot({
    marginLeft: 140,
    x: {
      domain: [0, 41],
      clamp: true,
      grid: true
    },
    y: {
      tickFormat: (i) => data[i].title.replace(" / Observable Plot", "")
    },
    marks: [
      Plot.barX(data, {
        x: "likes",
        y: (d, i) => i,
        href: (d) => `https://observablehq.com/@observablehq/${d.slug}`,
        target: "_blank"
      }),
      Plot.textX(data, {
        x: "likes",
        y: (d, i) => i,
        text: (d) => `${d.likes > 40 ? "⚡︎" : ""} ${d.likes}`,
        textAnchor: "end",
        fill: "white",
        dx: -3
      }),
      Plot.ruleX([0])
    ]
  });
}
