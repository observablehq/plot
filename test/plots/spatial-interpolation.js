import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

async function spatial(rasterize) {
  const ca55 = await d3.csv("data/ca55-south.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    color: {type: "diverging"},
    y: {reverse: true},
    marks: [
      Plot.raster(ca55, {
        pixelSize: rasterize ? 1 : 3,
        x: "GRID_EAST",
        y: "GRID_NORTH",
        fill: "MAG_IGRF90",
        imageRendering: "pixelated",
        rasterize
      })
    ]
  });
}

export async function spatialInterpolation() {
  return spatial();
}

export async function spatialInterpolationBarycentric() {
  return spatial(rasterizeBarycentric(false));
}

export async function spatialInterpolationBarycentricExtra() {
  return spatial(rasterizeBarycentric(true));
}

export async function spatialInterpolationSpheres() {
  return spatial(rasterizeWalkOnSpheres(3));
}

export async function spatialInterpolationVoronoi() {
  return spatial(rasterizeVoronoi);
}

async function walmart(rasterize) {
  const [walmarts, statemesh] = await Promise.all([
    d3.tsv("data/walmarts.tsv", d3.autoType),
    d3.json("data/us-counties-10m.json").then((us) =>
      mesh(us, {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries.filter((d) => d.id !== "02" && d.id !== "02" && d.id !== "15")
      })
    )
  ]);
  const projection = d3.geoAlbers();
  for (const d of walmarts) [d[0], d[1]] = projection([d.longitude, d.latitude]);
  for (const line of statemesh.coordinates) {
    for (let i = 0; i < line.length; ++i) line[i] = projection(line[i]);
  }
  return Plot.plot({
    axis: null,
    y: {reverse: true},
    color: {reverse: true, legend: true, label: "Opening year"},
    marks: [Plot.raster(walmarts, {fill: "date", rasterize}), Plot.geo(statemesh, {stroke: "white", strokeWidth: 1.5})]
  });
}

export async function spatialWalmart() {
  return walmart(rasterizeBarycentric(true));
}

export async function spatialWalmartSpheres() {
  return walmart(rasterizeWalkOnSpheres());
}

export async function spatialPenguins() {
  return penguins(rasterizeBarycentric(true));
}

export async function spatialPenguinsSpheres() {
  return penguins(rasterizeWalkOnSpheres(6));
}

async function penguins(rasterize) {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {
        pixelSize: 1,
        x: "body_mass_g",
        y: "flipper_length_mm",
        fill: "island",
        rasterize
      }),
      Plot.dot(penguins, {
        x: "body_mass_g",
        y: "flipper_length_mm",
        fill: "island",
        stroke: "white"
      })
    ]
  });
}

function Delaunay(index, X, Y) {
  return d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
}

function rasterizeVoronoi(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
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

function rasterizeBarycentric(extrapolate = true) {
  const ex = Symbol("extrapolate");
  return function (canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
    const {width, height} = canvas;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    let {r, g, b} = d3.rgb(this.fill) ?? {r, g, b};
    let a = (this.fillOpacity ?? 1) * 255;
    const {mix2, mix3} = mixer(F);

    // to extrapolate, we need to fill the rectangle; pad the perimeter with vertices all around.
    if (extrapolate) {
      const m = 101; // number of extrapolated points per side

      // renumber/reindex everything because we’re going to add points
      X = Array.from(index, (i) => X[i]); // take(X, index)
      Y = Array.from(index, (i) => Y[i]);
      F = F && Array.from(index, (i) => F[i]);
      FO = FO && Array.from(index, (i) => FO[i]);
      let i = index.length;
      index = d3.range(i);

      const addPoint = (x, y) => ((X[i] = x), (Y[i] = y), F && (F[i] = ex), FO && (FO[i] = ex), index.push(i++));
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
      const channels = [F, FO].filter((d) => d);
      for (const C of channels) {
        for (let i = 0; i < triangles.length; i += 3) {
          const a = triangles[i];
          const b = triangles[i + 1];
          const c = triangles[i + 2];
          if (C[a] === ex) C[a] = C[c] === ex ? C[b] : C[b] === ex ? C[c] : mix2(C[c], C[b]);
          if (C[b] === ex) C[b] = C[a] === ex ? C[c] : C[c] === ex ? C[a] : mix2(C[a], C[c]);
          if (C[c] === ex) C[c] = C[b] === ex ? C[a] : C[a] === ex ? C[b] : mix2(C[b], C[a]);
        }
      }
    }

    // Interpolate the interior of all triangles with barycentric coordinates
    const nepsilon = -1e-12; // tolerance for points that are on a triangle's edge
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
          if (ga < nepsilon) continue;
          const gb = ((Cy - Ay) * (x - Cx) + (y - Cy) * (Ax - Cx)) / z;
          if (gb < nepsilon) continue;
          const gc = 1 - ga - gb;
          if (gc < nepsilon) continue;
          const k = (x + width * y) << 2;
          if (F) ({r, g, b} = d3.rgb(color(mix3(F[ia], ga, F[ib], gb, F[ic], gc))));
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

function rasterizeWalkOnSpheres(blur = 0) {
  return function (canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
    const {width, height} = canvas;
    const random = d3.randomLcg(42);
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    let {r, g, b} = d3.rgb(this.fill) ?? {r, g, b};
    let a = (this.fillOpacity ?? 1) * 255;
    const delaunay = Delaunay(index, X, Y);
    let k = 0;
    let i;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, k += 4) {
        let cx = x,
          cy = y;
        for (let j = 0; j < 4; ++j) {
          i = delaunay.find(cx, cy, i);
          const dist = Math.hypot(X[index[i]] - cx, Y[index[i]] - cy);
          const angle = random() * 2 * Math.PI;
          cx += Math.cos(angle) * dist;
          cy += Math.sin(angle) * dist;
        }

        if (F) ({r, g, b} = d3.rgb(color(F[index[i]])));
        if (FO) a = FO[i] * 255;
        imageData[k + 0] = r;
        imageData[k + 1] = g;
        imageData[k + 2] = b;
        imageData[k + 3] = a;
      }
    }
    if (blur) d3.blurImage(image, blur);
    context2d.putImageData(image, 0, 0);
  };
}

function mixer(F) {
  // TODO isNumeric
  if (typeof F[0] === "number")
    return {
      mix2: (a, b) => (a + b) / 2,
      mix3: (a, ca, b, cb, c, cc) => ca * a + cb * b + cc * c
    };
  // TODO isTemporal
  if (F[0] instanceof Date)
    return {
      mix2: (a, b) => (+a + +b) / 2,
      mix3: (a, ca, b, cb, c, cc) => ca * a + cb * b + cc * c
    };
  const random = d3.randomLcg(42);
  return {
    mix2: (a, b) => (random() < 0.5 ? a : b),
    mix3: (a, ca, b, cb, c, cc) => {
      cc; // is ignored
      const u = random();
      return u < ca ? a : u < ca + cb ? b : c;
    }
  };
}
