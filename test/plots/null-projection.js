import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    width: 640,
    height: 400,
    projection: "identity",
    marks: [
      Plot.geo({
        type: "LineString",
        coordinates: Array.from({length: 400}, (_, i) => [
          320 + Math.cos(i / 10) * (i / 2),
          200 + Math.sin(i / 10) * (i / 2)
        ])
      })
    ]
  });
}
