import * as Plot from "@observablehq/plot";

const shape = {
  type: "LineString",
  coordinates: Array.from({length: 201}, (_, i) => {
    const angle = (i / 100) * Math.PI;
    const r = (i % 2) + 5;
    return [300 + 30 * r * Math.cos(angle), 185 + 30 * r * Math.sin(angle)];
  })
} as const;

export async function projectionHeightGeometry() {
  return Plot.plot({
    facet: {data: [0, 1], y: [0, 1]},
    projection: "identity",
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}

export async function projectionHeightDegenerate() {
  return Plot.plot({
    style: "border: #777 1px solid;",
    projection: "mercator",
    height: 400,
    inset: 199.5,
    marks: [Plot.graticule(), Plot.sphere()]
  });
}

export async function projectionHeightGeometryDomain() {
  return Plot.plot({
    projection: {type: "identity", domain: shape},
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}

export async function projectionHeightGeometryNull() {
  return Plot.plot({
    aspectRatio: true,
    width: 400,
    facet: {data: [0, 1], y: [0, 1]},
    marks: [Plot.geo(shape), Plot.frame({stroke: "red", strokeDasharray: 4})]
  });
}
