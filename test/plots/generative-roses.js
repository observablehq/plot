import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Generate roses from a cumulative sum of vectors with various angles. The
// twist is that each facet selects a subset of these angles to ignore (with
// facet: "exclude").
export default async function () {
  const data = d3.range(0, 48, 0.7);
  const mapped = (p) =>
    Plot.mapY(
      "cumsum",
      Plot.mapX("cumsum", {
        facet: "exclude",
        x: Math.sin,
        y: Math.cos,
        ...(p && {
          fill: () => p,
          title: () => p
        })
      })
    );
  return Plot.plot({
    facet: {
      data,
      x: (d, i) => (i % 8) % 3,
      y: (d, i) => Math.floor((i % 8) / 3),
      marginRight: 80
    },
    axis: null,
    marks: [
      Plot.line(data, {...mapped(null), curve: "natural"}),
      ["First", "Last", "MaxX", "MinX", "MaxY", "MinY"].map((p) =>
        Plot.dot(
          data,
          Plot[`select${p}`]({
            ...mapped(p),
            r: 6
          })
        )
      )
    ]
  });
}
