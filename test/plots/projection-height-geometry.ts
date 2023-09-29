import * as Plot from "@observablehq/plot";

export async function projectionHeightGeometry() {
  const shape = {
    type: "LineString",
    coordinates: Array.from({length: 201}, (_, i) => {
      const angle = (i / 100) * Math.PI;
      const r = (i % 2) + 5;
      return [300 + 30 * r * Math.cos(angle), 185 + 30 * r * Math.sin(angle)];
    })
  } as const;
  return Plot.plot({
    facet: {data: [0, 1], y: [0, 1]},
    projection: "identity",
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}

export async function projectionHeightGeometryNull() {
  const shape = {
    type: "LineString",
    coordinates: Array.from({length: 201}, (_, i) => {
      const angle = (i / 100) * Math.PI;
      const r = (i % 2) + 5;
      return [300 + 30 * r * Math.cos(angle), 185 + 30 * r * Math.sin(angle)];
    })
  } as const;
  return Plot.plot({
    aspectRatio: true,
    width: 400,
    facet: {data: [0, 1], y: [0, 1]},
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}
