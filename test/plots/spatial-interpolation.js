import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function spatial(interpolate) {
  const raw = await d3.csv("data/ca55-south.csv", d3.autoType);
  const width = 928;
  const height = 650;
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitExtent(
      [
        [5, 5],
        [width - 5, height - 5]
      ],
      {
        type: "MultiPoint",
        coordinates: raw.map((d) => [d.GRID_EAST, d.GRID_NORTH])
      }
    );
  const data = raw.map((d) => [...projection([d.GRID_EAST, d.GRID_NORTH]), d.MAG_IGRF90]);
  return Plot.plot({
    axis: null,
    color: {scheme: "blues"},
    marks: [
      Plot.raster(data, {
        pixelRatio: interpolate ? 1 : 3,
        x1: d3.min(data, (d) => d[0]),
        x2: d3.max(data, (d) => d[0]),
        y1: d3.min(data, (d) => d[1]),
        y2: d3.max(data, (d) => d[1]),
        x: "0",
        y: "1",
        fill: "2",
        imageRendering: "pixelated",
        interpolate // "nearest", "barycentric"
      })
    ]
  });
}

export async function barycentric() {
  return spatial(interpolateBarycentric);
}

export async function voronoi() {
  return spatial(interpolateVoronoi);
}

// this might be faster with a quadtree? or using delaunay.find with the memoization trick
function interpolateVoronoi(index, canvas, {X, Y, R, G, B, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context = canvas.getContext("2d");
  const v = d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  ).voronoi([0, 0, width, height]);
  for (let i = 0; i < index.length; ++i) {
    const j = index[i];
    context.fillStyle = `rgba(${R ? R[j] : r},${G ? G[j] : g},${B ? B[j] : b},${FO ? FO[j] : a})`;
    context.beginPath();
    v.renderCell(i, context);
    context.fill();
  }
}

function interpolateBarycentric(index, canvas, {X, Y, R, G, B, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;

  const delaunay = d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
  const {points, triangles} = delaunay;

  // Interpolate the interior of all triangles with barycentric coordinates
  for (let i = 0; i < triangles.length; i += 3) {
    const T = triangles.subarray(i, i + 3);
    let [ia, ib, ic] = Array.from(T, (i) => index[i]);

    const [Ax, Bx, Cx] = Array.from(T, (i) => points[2 * i]);
    const [Ay, By, Cy] = Array.from(T, (i) => points[2 * i + 1]);
    const [x0, x1] = d3.extent([Ax, Bx, Cx]);
    const [y0, y1] = d3.extent([Ay, By, Cy]);

    const z = (By - Cy) * (Ax - Cx) + (Ay - Cy) * (Cx - Bx);
    if (!z) continue;

    for (let x = Math.floor(x0); x < x1; x++) {
      for (let y = Math.floor(y0); y < y1; y++) {
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const ga = ((By - Cy) * (x - Cx) + (y - Cy) * (Cx - Bx)) / z;
        if (ga < 0) continue;
        const gb = ((Cy - Ay) * (x - Cx) + (y - Cy) * (Ax - Cx)) / z;
        if (gb < 0) continue;
        const gc = 1 - ga - gb;
        if (gc < 0) continue;
        const k = (x + width * y) << 2;
        imageData[k + 0] = R ? ga * R[ia] + gb * R[ib] + gc * R[ic] : r;
        imageData[k + 1] = G ? ga * G[ia] + gb * G[ib] + gc * G[ic] : g;
        imageData[k + 2] = B ? ga * B[ia] + gb * B[ib] + gc * B[ic] : b;
        imageData[k + 3] = FO ? (ga * FO[ia] + gb * FO[ib] + gc * FO[ic]) * 255 : a;
      }
    }
  }
  context2d.putImageData(image, 0, 0);
}
