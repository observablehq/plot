import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function spatial(rasterize) {
  const ca55 = await d3.csv("data/ca55-south.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    color: {type: "diverging"},
    y: {reverse: true},
    marks: [
      Plot.raster(ca55, {
        pixelRatio: rasterize ? 1 : 3,
        x: "GRID_EAST",
        y: "GRID_NORTH",
        fill: "MAG_IGRF90",
        imageRendering: "pixelated",
        rasterize
      })
    ]
  });
}

export async function spatialInterpolationNone() {
  return spatial();
}

export async function spatialInterpolationBarycentric() {
  return spatial(interpolateBarycentric(false));
}

export async function spatialInterpolationBarycentricExtra() {
  return spatial(interpolateBarycentric(true));
}

export async function spatialInterpolationVoronoi() {
  return spatial(interpolateVoronoi);
}

export async function spatialInterpolationWalmart() {
  const walmarts = await d3.tsv("data/walmarts.tsv", d3.autoType);
  const projection = d3.geoAlbers();
  for (const d of walmarts) [d[0], d[1]] = projection([d.longitude, d.latitude]);
  return Plot.plot({
    axis: null,
    y: {reverse: true},
    color: {reverse: true, legend: true, label: "Opening year"},
    marks: [Plot.raster(walmarts, {fill: "date", rasterize: interpolateBarycentric(true)})]
  });
}

function Delaunay(index, X, Y) {
  return d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
}

// this might be faster with a quadtree? or using delaunay.find with the memoization trick
function interpolateVoronoi(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  const {width, height} = canvas;
  const context = canvas.getContext("2d");
  const voronoi = Delaunay(index, X, Y).voronoi([0, 0, width, height]);
  context.fillStyle = this.fill;
  context.globalAlpha = this.fillOpacity;
  for (let i = 0; i < index.length; ++i) {
    context.beginPath();
    voronoi.renderCell(i, context);
    const j = index[i];
    if (F) context.fillStyle = color(F[j]);
    if (FO) context.globalAlpha = Math.abs(FO[j]);
    context.fill();
    if (context.globalAlpha === 1) (context.strokeStyle = context.fillStyle), context.stroke();
  }
}

function interpolateBarycentric(extrapolate = true) {
  return function (canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
    const {width, height} = canvas;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    let {r, g, b} = d3.rgb(this.fill) ?? {r, g, b};
    let a = (this.fillOpacity ?? 1) * 255;

    // to extrapolate, we need to fill the rectangle; pad the perimeter with vertices all around.
    if (extrapolate) {
      const m = 101; // number of extrapolated points per side
      let i = index.length;

      // renumber/reindex everything because we’re going to add points
      X = Array.from(index, (i) => X[i]);
      Y = Array.from(index, (i) => Y[i]);
      F = F && Array.from(index, (i) => +F[i]); // coerce prior to interpolation
      FO = FO && Array.from(index, (i) => FO[i]);
      index = d3.range(index.length);

      const addPoint = (x, y) => (index.push(++i), (X[i] = x), (Y[i] = y), (F[i] = NaN));
      for (let j = 0; j < m; ++j) {
        const k = j / (m - 1);
        addPoint(k * width, -1);
        addPoint((1 - k) * width, height + 1);
        addPoint(-1, k * height);
        addPoint(width + 1, (1 - k) * height);
      }
    }

    const {points, triangles} = Delaunay(index, X, Y);

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
          if (FO) a = (ga * FO[ia] + gb * FO[ib] + gc * FO[ic]) * 255;
          imageData[k + 0] = r;
          imageData[k + 1] = g;
          imageData[k + 2] = b;
          imageData[k + 3] = a;
        }
      }
    }
    context2d.putImageData(image, 0, 0);
  };
}
