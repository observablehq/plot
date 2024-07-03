import * as Plot from "@observablehq/plot";

export async function projectionFitIdentity() {
  return Plot.plot({
    width: 640,
    height: 400,
    projection: {
      type: "identity",
      domain: {
        type: "MultiPoint",
        coordinates: [
          [-32, -20],
          [32, 20]
        ]
      }
    },
    marks: [
      Plot.geo({
        type: "LineString",
        coordinates: Array.from({length: 400}, (_, i) => [Math.cos(i / 10) * (i / 20), Math.sin(i / 10) * (i / 20)])
      })
    ]
  });
}
