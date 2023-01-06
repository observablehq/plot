import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";
import {rasterizer} from "../../src/marks/raster";

// TODO blur
async function spatial(rasterize) {
  const ca55 = await d3.csv("data/ca55-south.csv", d3.autoType);
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {
      type: "identity",
      inset: 3,
      domain: {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])}
    },
    y: {reverse: true},
    color: {type: "diverging"},
    marks: [
      Plot.raster(
        ca55,
        namedRasterizer({
          //fx: (d) => d["MAG_IGRF90"] > 0,
          pixelSize: rasterize ? 1 : 3,
          x: "GRID_EAST",
          y: "GRID_NORTH",
          fill: "MAG_IGRF90",
          imageRendering: rasterize ? undefined : "pixelated",
          rasterize
        })
      ),
      Plot.hull(ca55, {x: "GRID_EAST", y: "GRID_NORTH"})
    ]
  });
}

function namedRasterizer({rasterize, ...options} = {}) {
  if (typeof rasterize === "string") {
    switch (`${rasterize}`.toLowerCase()) {
      case "nn":
        return rasterizer(options, wosDraw({wos: 0}));
      case "wos":
        return rasterizer(options, wosDraw({wos: 2}));
      case "barycentric":
        return rasterizer(options, barycentricDraw({extrapolate: false}));
      case "barycentric-extra":
        return rasterizer(options, barycentricDraw({extrapolate: true}));
      default:
        throw new Error(`unsupported rasterize: ${rasterize}`);
    }
  }
  return options;
}

function wosDraw({wos}) {
  return function (facets, {x: X, y: Y, fill}, {width, height}) {
    const F = new Array(width * height * facets.length);
    let k = 0;
    let i;
    for (const index of facets) {
      const random = d3.randomLcg(42);
      const delaunay = Delaunay(index, X, Y);
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, ++k) {
          let cx = x;
          let cy = y;
          i = delaunay.find(cx, cy, i);
          for (let j = 0; j < wos; ++j) {
            const dist = Math.hypot(X[index[i]] - cx, Y[index[i]] - cy);
            const angle = random() * 2 * Math.PI;
            cx += Math.cos(angle) * dist;
            cy += Math.sin(angle) * dist;
            i = delaunay.find(cx, cy, i);
          }
          F[k] = fill[index[i]];
        }
      }
    }
    return F;
  };
}

function barycentricDraw({extrapolate}) {
  const ex = Symbol("extrapolate");
  return function (facets, {x: X, y: Y, fill: F, fillOpacity: FO}, {width, height}) {
    const F0 = new Array(width * height * facets.length);
    let k = 0;
    let i;
    const {mix2, mix3} = mixer(F);
    for (let index of facets) {
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
            const k = x + width * y;
            F0[k] = mix3(F[ia], ga, F[ib], gb, F[ic], gc);
          }
        }
      }
    }
    return F0;
  };
}

export async function spatialInterpolation() {
  return spatial();
}

export async function spatialInterpolationBarycentric() {
  return spatial("barycentric");
}

export async function spatialInterpolationBarycentricExtra() {
  return spatial("barycentric-extra");
}

export async function spatialInterpolationSpheres() {
  return spatial("wos");
}

export async function spatialInterpolationVoronoi() {
  return spatial("nn");
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
  return Plot.plot({
    color: {reverse: true, legend: true, label: "Opening year"},
    projection: "albers",
    marks: [
      Plot.raster(walmarts, namedRasterizer({x: "longitude", y: "latitude", fill: "date", rasterize})),
      Plot.geo(statemesh, {stroke: "white", strokeWidth: 1.5})
    ]
  });
}

export async function spatialWalmart() {
  return walmart("barycentric-extra");
}

export async function spatialWalmartSpheres() {
  return walmart("wos");
}

export async function spatialPenguins() {
  return penguins("barycentric-extra");
}

export async function spatialPenguinsSpheres() {
  return penguins("wos");
}

async function penguins(rasterize) {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, namedRasterizer({x: "body_mass_g", y: "flipper_length_mm", fill: "island", rasterize})),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
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
