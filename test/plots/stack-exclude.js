import * as Plot from "@observablehq/plot";

export default async function () {
  const data = Float64Array.of(1, 2, 3);
  const facets = ["a", "b", "c"];
  return Plot.plot({
    height: 180,
    facet: {data, x: facets},
    marks: [
      Plot.barY(data, {
        stroke: (d) => d, // channel as accessor
        fill: data, // channel as array
        fillOpacity: 0.5,
        facet: "exclude"
      }),
      Plot.textY(
        data,
        Plot.stackY({
          y: data,
          text: (d, i) => i, // the original index
          facet: "exclude"
        })
      )
    ]
  });
}
