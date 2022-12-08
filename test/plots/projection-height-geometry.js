import * as Plot from "@observablehq/plot";

export default async function () {
  const shape = {
    type: "LineString",
    coordinates: Array.from({length: 201}, (_, i) => {
      const angle = (i / 100) * Math.PI;
      const r = (i % 2) + 5;
      return [340 + 30 * r * Math.cos(angle), 185 + 30 * r * Math.sin(angle)];
    })
  };
  return Plot.plot({
    facet: {data: [0, 1], y: [0, 1]},
    projection: null,
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}
