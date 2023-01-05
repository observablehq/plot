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

export async function walmart() {
  const raw = await d3.tsv("data/walmarts.tsv", d3.autoType);
  const width = 928;
  const height = 650;
  const projection = d3.geoAlbersUsa().fitExtent(
    [
      [5, 5],
      [width - 5, height - 5]
    ],
    {
      type: "MultiPoint",
      coordinates: raw.map((d) => [d.longitude, d.latitude])
    }
  );
  const data = raw.map((d) => [...projection([d.longitude, d.latitude]), d.date]);
  return Plot.plot({
    axis: null,
    color: {reverse: true, legend: true, label: "date"},
    marks: [
      Plot.raster(data, {
        x1: d3.min(data, (d) => d[0]),
        x2: d3.max(data, (d) => d[0]),
        y1: d3.min(data, (d) => -d[1]),
        y2: d3.max(data, (d) => -d[1]),
        x: "0",
        y: (d) => -d[1],
        fill: "2",
        interpolate: interpolateBarycentric(true)
      })
    ]
  });
}

export async function barycentric() {
  return spatial(interpolateBarycentric(false));
}

export async function barycentricExtra() {
  return spatial(interpolateBarycentric(true));
}

export async function voronoi() {
  return spatial(interpolateVoronoi);
}

// this might be faster with a quadtree? or using delaunay.find with the memoization trick
function interpolateVoronoi(index, canvas, {color}, {X, Y, F, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context = canvas.getContext("2d");
  const v = d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  ).voronoi([0, 0, width, height]);
  context.strokeStyle = context.fillStyle = `rgb(${r},${g},${b})`;
  context.globalAlpha = a;
  for (let i = 0; i < index.length; ++i) {
    context.beginPath();
    v.renderCell(i, context);
    const j = index[i];
    if (F) context.strokeStyle = context.fillStyle = color(F[j]);
    if (FO) context.globalAlpha = FO[j];
    context.fill();
    context.stroke();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function interpolateNearest(index, canvas, {color}, {X, Y, F, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  const q = d3.quadtree(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
  let k = 0;
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x, k += 4) {
      const i = q.find(x, y);
      if (F) ({r, g, b} = d3.rgb(color(F[i])));
      imageData[k + 0] = r;
      imageData[k + 1] = g;
      imageData[k + 2] = b;
      imageData[k + 3] = FO ? FO[i] * 255 : a;
    }
  }
  context2d.putImageData(image, 0, 0);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function interpolateDelaunay(index, canvas, {color}, {X, Y, F, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  const d = d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
  let k = 0;
  let i;
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x, k += 4) {
      i = d.find(x, y, i);
      if (F) ({r, g, b} = d3.rgb(color(F[i])));
      imageData[k + 0] = r;
      imageData[k + 1] = g;
      imageData[k + 2] = b;
      imageData[k + 3] = FO ? FO[i] * 255 : a;
    }
  }
  context2d.putImageData(image, 0, 0);
}

function interpolateBarycentric(extrapolate = true) {
  return (index, canvas, {color}, {X, Y, F, FO}, {r, g, b, a}) => {
    const {width, height} = canvas;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;

    // renumber/reindex everything, because we're going to add points if extrapolate is true
    X = Array.from(index, (i) => X[i]);
    Y = Array.from(index, (i) => Y[i]);
    F = F && Array.from(index, (i) => +F[i]); // coerce prior to interpolation (e.g., dates)
    FO = FO && Array.from(index, (i) => +FO[i]);
    index = d3.range(index.length);

    // to extrapolate, we need to fill the rectangle; pad the perimeter with vertices all around.
    if (extrapolate) {
      let i = 1 + index.length;
      const addPoint = (x, y) => {
        (X[i] = x), (Y[i] = y), (F[i] = NaN), index.push(i++);
      };
      for (let k = 0; k < 1.01; k += 0.01) {
        addPoint(k * width, -1);
        addPoint((1 - k) * width, height + 1);
        addPoint(-1, k * height);
        addPoint(width + 1, (1 - k) * height);
      }
    }

    const delaunay = d3.Delaunay.from(
      index,
      (i) => X[i],
      (i) => Y[i]
    );
    const {points, triangles} = delaunay;

    // Some triangles have one undefined value; other triangles have two. Fill
    // each undefined vertex with an average of the other defined vertices.
    if (extrapolate) {
      for (let i = 0; i < triangles.length; i += 3) {
        const ia = index[triangles[i]];
        const ib = index[triangles[i + 1]];
        const ic = index[triangles[i + 2]];
        const fa = F[ia];
        const fb = F[ib];
        const fc = F[ic];
        if (isNaN(fa)) F[ia] = ((isNaN(fc) ? fb : fc) + (isNaN(fb) ? fc : fb)) / 2;
        if (isNaN(fb)) F[ib] = ((isNaN(fa) ? fc : fa) + (isNaN(fc) ? fa : fc)) / 2;
        if (isNaN(fc)) F[ic] = ((isNaN(fb) ? fa : fb) + (isNaN(fa) ? fb : fa)) / 2;
      }
    }

    // Interpolate the interior of all triangles with barycentric coordinates
    for (let i = 0; i < triangles.length; i += 3) {
      const ta = triangles[i];
      const tb = triangles[i + 1];
      const tc = triangles[i + 2];
      const Ax = points[2 * ta];
      const Bx = points[2 * tb];
      const Cx = points[2 * tc];
      const Ay = points[2 * ta + 1];
      const By = points[2 * tb + 1];
      const Cy = points[2 * tc + 1];
      const x1 = Math.min(Ax, Bx, Cx);
      const x2 = Math.max(Ax, Bx, Cx);
      const y1 = Math.min(Ay, By, Cy);
      const y2 = Math.max(Ay, By, Cy);
      const z = (By - Cy) * (Ax - Cx) + (Ay - Cy) * (Cx - Bx);
      if (!z) continue;
      const ia = index[ta];
      const ib = index[tb];
      const ic = index[tc];
      for (let x = Math.floor(x1); x < x2; x++) {
        for (let y = Math.floor(y1); y < y2; y++) {
          if (x < 0 || x >= width || y < 0 || y >= height) continue;
          const ga = ((By - Cy) * (x - Cx) + (y - Cy) * (Cx - Bx)) / z;
          if (ga < 0) continue;
          const gb = ((Cy - Ay) * (x - Cx) + (y - Cy) * (Ax - Cx)) / z;
          if (gb < 0) continue;
          const gc = 1 - ga - gb;
          if (gc < 0) continue;
          const k = (x + width * y) << 2;
          if (F) ({r, g, b} = d3.rgb(color(ga * F[ia] + gb * F[ib] + gc * F[ic])));
          imageData[k + 0] = r;
          imageData[k + 1] = g;
          imageData[k + 2] = b;
          imageData[k + 3] = FO ? (ga * FO[ia] + gb * FO[ib] + gc * FO[ic]) * 255 : a;
        }
      }
    }
    context2d.putImageData(image, 0, 0);
  };
}
