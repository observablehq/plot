import {Delaunay, randomLcg, range, rgb} from "d3";
import {create} from "../context.js";
import {map, first, second, third, isTuples, isNumeric, isTemporal} from "../options.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "raster",
  stroke: null
};

function nonnull(input, name) {
  if (input == null) throw new Error(`missing ${name}`);
}

function number(input, name) {
  const x = +input;
  if (isNaN(x)) throw new Error(`invalid ${name}: ${input}`);
  return x;
}

function integer(input, name) {
  const x = Math.floor(input);
  if (isNaN(x)) throw new Error(`invalid ${name}: ${input}`);
  return x;
}

export class Raster extends Mark {
  constructor(data, options = {}) {
    let {
      width,
      height,
      x,
      y,
      // If X and Y are not given, we assume that F is a dense array of samples
      // covering the entire grid in row-major order. These defaults allow
      // further shorthand where x and y represent grid column and row index.
      x1 = x == null ? 0 : undefined,
      y1 = y == null ? 0 : undefined,
      x2 = x == null ? width : undefined,
      y2 = y == null ? height : undefined,
      imageRendering,
      pixelSize = 1,
      fill,
      fillOpacity,
      rasterize = x == null || y == null ? rasterizeDense : rasterizeNone
    } = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1 == null ? nonnull(x, "x") : [number(x1, "x1")], scale: "x", optional: true, filter: null},
        y1: {value: y1 == null ? nonnull(y, "y") : [number(y1, "y1")], scale: "y", optional: true, filter: null},
        x2: {value: x2 == null ? nonnull(x, "x") : [number(x2, "x2")], scale: "x", optional: true, filter: null},
        y2: {value: y2 == null ? nonnull(y, "y") : [number(y2, "y2")], scale: "y", optional: true, filter: null}
      },
      data == null && (typeof fill === "function" || typeof fillOpacity === "function") ? sampleFill(options) : options,
      defaults
    );
    this.width = width === undefined ? undefined : integer(width, "width");
    this.height = height === undefined ? undefined : integer(height, "height");
    this.pixelSize = number(pixelSize, "pixelSize");
    this.imageRendering = impliedString(imageRendering, "auto");
    this.rasterize = maybeRasterize(rasterize);
    this.opacity ??= this.fillOpacity;
    this.fillOpacity = undefined;
  }
  // Ignore the color scale, so the fill channel is returned unscaled.
  scale(channels, {color, ...scales}, context) {
    return super.scale(channels, scales, context);
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    let {x1, y1, x2, y2} = channels;
    x1 = x1 ? x1[0] : dimensions.marginLeft;
    x2 = x2 ? x2[0] : dimensions.width - dimensions.marginRight;
    y1 = y1 ? y1[0] : dimensions.marginTop;
    y2 = y2 ? y2[0] : dimensions.height - dimensions.marginBottom;
    const {document} = context;
    const imageWidth = Math.abs(x2 - x1);
    const imageHeight = Math.abs(y2 - y1);
    const {
      pixelSize,
      width = Math.round(imageWidth / pixelSize),
      height = Math.round(imageHeight / pixelSize),
      imageRendering
    } = this;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // If either X or Y are not given, then assume that F is a dense array of
    // samples covering the entire grid in row-major order; in this case, the
    // order of x1-x2 and y1-y2 matters, as the grid starts in x1, y1.
    if (X && x2 < x1) [x2, x1] = [x1, x2];
    if (Y && y2 < y1) [y2, y1] = [y1, y2];
    const kx = width / imageWidth;
    const ky = height / imageHeight;
    this.rasterize(canvas, index, scales, channels, {
      x: X && map(X, (x) => (x - x1) * kx, Float64Array),
      y: Y && map(Y, (y) => (y - y1) * ky, Float64Array)
    });
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .append("image")
          .attr("transform", `translate(${x1},${y1}) scale(${Math.sign(x2 - x1)},${Math.sign(y2 - y1)})`)
          .attr("width", imageWidth)
          .attr("height", imageHeight)
          .attr("preserveAspectRatio", "none")
          .call(applyAttr, "image-rendering", imageRendering)
          .call(applyDirectStyles, this)
          .attr("xlink:href", canvas.toDataURL())
      )
      .node();
  }
}

export function raster(data, options) {
  if (arguments.length < 2) (options = data), (data = null);
  let {x, y, fill, ...rest} = options;
  // Because we implicit x and y when fill is a function of (x, y), and when
  // data is a dense grid, we must further disambiguate by testing whether data
  // contains [x, y, z?] tuples. Hence you can’t use this shorthand with a
  // transform that lazily generates tuples, but that seems reasonable since
  // this is just for convenience anyway.
  if (x === undefined && y === undefined && isTuples(data)) {
    (x = first), (y = second);
    if (fill === undefined) fill = third;
  }
  return new Raster(data, {...rest, x, y, fill});
}

// Evaluates a function at pixel midpoints. TODO Faceting? Optimize linear?
function sampleFill({fill, fillOpacity, pixelSize = 1, ...options} = {}) {
  if (typeof fill !== "function") (options.fill = fill), (fill = null);
  if (typeof fillOpacity !== "function") (options.fillOpacity = fillOpacity), (fillOpacity = null);
  return initializer(options, (data, facets, {x1, y1, x2, y2}, {x, y}) => {
    // TODO Allow projections, if invertible.
    if (!x) throw new Error("missing scale: x");
    if (!y) throw new Error("missing scale: y");
    let {width: w, height: h} = options;
    (x1 = x(x1.value[0])), (y1 = y(y1.value[0])), (x2 = x(x2.value[0])), (y2 = y(y2.value[0]));
    // Note: this must exactly match the defaults in render above!
    if (w === undefined) w = Math.round(Math.abs(x2 - x1) / pixelSize);
    if (h === undefined) h = Math.round(Math.abs(y2 - y1) / pixelSize);
    const kx = (x2 - x1) / w;
    const ky = (y2 - y1) / h;
    (x1 += kx / 2), (y1 += ky / 2);
    let F, FO;
    if (fill) {
      F = new Array(w * h);
      for (let yi = 0, i = 0; yi < h; ++yi) {
        for (let xi = 0; xi < w; ++xi, ++i) {
          F[i] = fill(x.invert(x1 + xi * kx), y.invert(y1 + yi * ky));
        }
      }
    }
    if (fillOpacity) {
      FO = new Array(w * h);
      for (let yi = 0, i = 0; yi < h; ++yi) {
        for (let xi = 0; xi < w; ++xi, ++i) {
          FO[i] = fillOpacity(x.invert(x1 + xi * kx), y.invert(y1 + yi * ky));
        }
      }
    }
    return {
      data: F ?? FO,
      facets,
      channels: {
        ...(F && {fill: {value: F, scale: "color"}}),
        ...(FO && {fillOpacity: {value: FO, scale: "opacity"}})
      }
    };
  });
}

function maybeRasterize(rasterize) {
  if (typeof rasterize === "function") return rasterize;
  if (rasterize == null) return rasterizeNone;
  switch (`${rasterize}`.toLowerCase()) {
    case "none":
      return rasterizeNone;
    case "dense":
      return rasterizeDense;
    case "nearest":
      return rasterizeNearest;
    case "barycentric":
      return rasterizeBarycentric;
    case "random-walk":
      return rasterizeRandomWalk;
  }
  throw new Error(`invalid rasterize: ${rasterize}`);
}

// Applies a simple forward mapping of samples, binning them into pixels without
// any blending or interpolation.
function rasterizeNone(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  let {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
  let a = 255;
  for (const i of index) {
    if (X[i] < 0 || X[i] >= width || Y[i] < 0 || Y[i] >= height) continue;
    const j = (Math.floor(Y[i]) * width + Math.floor(X[i])) << 2;
    if (F) ({r, g, b} = rgb(color(F[i])));
    if (FO) a = FO[i] * 255;
    imageData[j + 0] = r;
    imageData[j + 1] = g;
    imageData[j + 2] = b;
    imageData[j + 3] = a;
  }
  context2d.putImageData(image, 0, 0);
}

// Assumes that the fill and/or fillOpacity channels are a dense grid of values
// that correspond to the size of the given canvas, in row-major order.
function rasterizeDense(canvas, index, {color}, {fill: F, fillOpacity: FO}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  let {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
  let a = 255;
  for (let i = 0, n = width * height; i < n; ++i) {
    const j = i << 2;
    if (F) {
      const fi = color(F[i]);
      if (fi == null) {
        imageData[j + 3] = 0;
        continue;
      }
      ({r, g, b} = rgb(fi));
    }
    if (FO) a = FO[i] * 255;
    imageData[j + 0] = r;
    imageData[j + 1] = g;
    imageData[j + 2] = b;
    imageData[j + 3] = a;
  }
  context2d.putImageData(image, 0, 0);
}

function rasterizeNearest(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  const {width, height} = canvas;
  const context = canvas.getContext("2d");
  const voronoi = Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  ).voronoi([0, 0, width, height]);
  context.fillStyle = this.fill;
  for (let i = 0; i < index.length; ++i) {
    context.beginPath();
    voronoi.renderCell(i, context);
    const j = index[i];
    if (F) context.fillStyle = color(F[j]);
    if (FO) context.globalAlpha = Math.abs(FO[j]);
    else (context.strokeStyle = context.fillStyle), context.stroke();
    context.fill();
  }
}

const ex = Symbol("extrapolate");

function rasterizeBarycentric(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  const random = randomLcg(42); // TODO allow configurable rng?
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  let {r, g, b} = rgb(this.fill) ?? {r, g, b};
  let a = 255;

  // renumber/reindex everything because we’re going to add points
  let i = index.length;
  X = Array.from(index, (i) => X[i]); // take(X, index)
  Y = Array.from(index, (i) => Y[i]);
  F = F && Array.from(index, (i) => F[i]);
  FO = FO && Array.from(index, (i) => FO[i]);
  index = range(i);

  // to extrapolate, we need to fill the rectangle; pad the perimeter with vertices all around
  const addPoint = (x, y) => ((X[i] = x), (Y[i] = y), F && (F[i] = ex), FO && (FO[i] = ex), index.push(i++));
  for (let j = 0, m = (width >> 2) - 1; j <= m; ++j) {
    const k = j / m;
    addPoint(k * width, -1);
    addPoint((1 - k) * width, height + 1);
  }
  for (let j = 0, m = (height >> 2) - 1; j <= m; ++j) {
    const k = j / m;
    addPoint(-1, k * height);
    addPoint(width + 1, (1 - k) * height);
  }

  const {points, triangles} = Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );

  // Some triangles have one undefined value; other triangles have two. Fill
  // each undefined vertex with an average of the other defined vertices.
  for (const C of [F, FO].filter((d) => d)) {
    const mix2 = mixer2(C, random);
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i];
      const b = triangles[i + 1];
      const c = triangles[i + 2];
      if (C[a] === ex) C[a] = C[c] === ex ? C[b] : C[b] === ex ? C[c] : mix2(C[c], C[b]);
      if (C[b] === ex) C[b] = C[a] === ex ? C[c] : C[c] === ex ? C[a] : mix2(C[a], C[c]);
      if (C[c] === ex) C[c] = C[b] === ex ? C[a] : C[a] === ex ? C[b] : mix2(C[b], C[a]);
    }
  }

  // Interpolate the interior of all triangles with barycentric coordinates
  const mix3 = F && mixer3(F, random);
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
    for (let x = Math.floor(x1); x < x2; ++x) {
      for (let y = Math.floor(y1); y < y2; ++y) {
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const xp = x + 0.5; // sample pixel centroids
        const yp = y + 0.5;
        const ga = ((By - Cy) * (xp - Cx) + (yp - Cy) * (Cx - Bx)) / z;
        if (ga < nepsilon) continue;
        const gb = ((Cy - Ay) * (xp - Cx) + (yp - Cy) * (Ax - Cx)) / z;
        if (gb < nepsilon) continue;
        const gc = 1 - ga - gb;
        if (gc < nepsilon) continue;
        const k = (x + width * y) << 2;
        if (F) ({r, g, b} = rgb(color(mix3(F[ia], ga, F[ib], gb, F[ic], gc))));
        if (FO) a = (ga * FO[ia] + gb * FO[ib] + gc * FO[ic]) * 255;
        imageData[k + 0] = r;
        imageData[k + 1] = g;
        imageData[k + 2] = b;
        imageData[k + 3] = a;
      }
    }
  }
  context2d.putImageData(image, 0, 0);
}

// TODO adaptive supersampling in areas of high variance?
// TODO configurable iterations per sample (currently 1 + 2)
// see https://observablehq.com/@observablehq/walk-on-spheres-precision
function rasterizeRandomWalk(canvas, index, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  rasterizeNone.apply(this, arguments);
  const random = randomLcg(42); // TODO allow configurable rng?
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.getImageData(0, 0, width, height);
  const imageData = image.data;
  let {r, g, b} = rgb(this.fill) ?? {r, g, b};
  let a = 255;
  // memoization of delaunay.find for the line start (iy), pixel (ix), and wos step (iw)
  let iy, ix, iw, delaunay;
  for (let y = 0.5, k = 0; y < height; y++) {
    ix = iy;
    for (let x = 0.5; x < width; x++, k += 4) {
      // skip points that have been directly painted
      if (imageData[k + 3] > 0) continue;
      // lazily compute the Delaunay the first time we need it
      delaunay ??= Delaunay.from(
        index,
        (i) => X[i],
        (i) => Y[i]
      );
      iw = ix = delaunay.find(x, y, ix);
      if (x === 0) iy = ix;
      for (let j = 0, cx = x, cy = y; j < 2; ++j) {
        const radius = Math.hypot(X[index[iw]] - cx, Y[index[iw]] - cy);
        const angle = random() * 2 * Math.PI;
        cx += Math.cos(angle) * radius;
        cy += Math.sin(angle) * radius;
        iw = delaunay.find(cx, cy, iw);
      }
      if (F) ({r, g, b} = rgb(color(F[index[iw]])));
      if (FO) a = FO[index[iw]] * 255;
      imageData[k + 0] = r;
      imageData[k + 1] = g;
      imageData[k + 2] = b;
      imageData[k + 3] = a;
    }
  }
  context2d.putImageData(image, 0, 0);
}

function blend2(a, b) {
  return (+a + +b) / 2; // coerce in case dates
}

function blend3(a, ca, b, cb, c, cc) {
  return ca * a + cb * b + cc * c;
}

function pick2(random = Math.random) {
  return (a, b) => (random() < 0.5 ? a : b);
}

function pick3(random = Math.random) {
  return (a, ca, b, cb, c) => {
    const u = random();
    return u < ca ? a : u < ca + cb ? b : c;
  };
}

function mixer2(F, random) {
  return isNumeric(F) || isTemporal(F) ? blend2 : pick2(random);
}

function mixer3(F, random) {
  return isNumeric(F) || isTemporal(F) ? blend3 : pick3(random);
}
