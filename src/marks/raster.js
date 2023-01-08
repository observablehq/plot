import {Delaunay, randomLcg, rgb} from "d3";
import {create} from "../context.js";
import {map, first, second, third, isTuples, isNumeric, isTemporal, take} from "../options.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "raster",
  stroke: null,
  pixelSize: 1
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

export class AbstractRaster extends Mark {
  constructor(data, channels, options = {}, defaults) {
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
      pixelSize = defaults.pixelSize,
      interpolate
    } = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1 == null ? nonnull(x, "x") : [number(x1, "x1")], scale: "x", optional: true, filter: null},
        y1: {value: y1 == null ? nonnull(y, "y") : [number(y1, "y1")], scale: "y", optional: true, filter: null},
        x2: {value: x2 == null ? nonnull(x, "x") : [number(x2, "x2")], scale: "x", optional: true, filter: null},
        y2: {value: y2 == null ? nonnull(y, "y") : [number(y2, "y2")], scale: "y", optional: true, filter: null},
        ...channels
      },
      options,
      defaults
    );
    this.width = width === undefined ? undefined : integer(width, "width");
    this.height = height === undefined ? undefined : integer(height, "height");
    this.pixelSize = number(pixelSize, "pixelSize");
    this.interpolate = interpolate === undefined && (x == null || y == null) ? null : maybeInterpolate(interpolate);
  }
}

export class Raster extends AbstractRaster {
  constructor(data, options = {}) {
    const {imageRendering} = options;
    super(data, undefined, data == null ? sampler("fill", sampler("fillOpacity", options)) : framer(options), defaults);
    this.imageRendering = impliedString(imageRendering, "auto");
    // When a constant fillOpacity is specified, treat it as if a constant
    // opacity had been specified instead; this will produce an equivalent
    // result, but simplifies rasterization (and in the case of the nearest
    // rasterization method, allows a stroke to fill antialiasing seams).
    this.opacity ??= this.fillOpacity;
    this.fillOpacity = undefined;
  }
  // Ignore the color scale, so the fill channel is returned unscaled.
  scale(channels, {color, ...scales}, context) {
    return super.scale(channels, scales, context);
  }
  render(index, scales, channels, dimensions, context) {
    const {color} = scales;
    const {x: X, y: Y} = channels;
    let {x1: [x1], y1: [y1], x2: [x2], y2: [y2]} = channels; // prettier-ignore
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
    let {fill: F, fillOpacity: FO} = channels;
    if (this.interpolate) {
      const IX = X && map(X, (x) => (x - x1) * kx, Float64Array);
      const IY = Y && map(Y, (y) => (y - y1) * ky, Float64Array);
      if (F) F = this.interpolate(index, width, height, IX, IY, F);
      if (FO) FO = this.interpolate(index, width, height, IX, IY, FO);
    }
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

export function maybeTuples(data, options) {
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
  return [data, {...rest, x, y, fill}];
}

export function raster() {
  return new Raster(...maybeTuples(...arguments));
}

// If any of x1, y1, x2, or y2 are undefined, infers the corresponding value
// from the frame dimensions.
export function framer(options) {
  return initializer(options, function (data, facets, {x1, y1, x2, y2}, scales, dimensions) {
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const channels = {};
    if (x1 === undefined) channels.x1 = {value: [marginLeft], filter: null};
    if (y1 === undefined) channels.y1 = {value: [marginTop], filter: null};
    if (x2 === undefined) channels.x2 = {value: [width - marginRight], filter: null};
    if (y2 === undefined) channels.y2 = {value: [height - marginBottom], filter: null};
    return {channels};
  });
}

// Evaluates the function with the given name, if it exists, on the raster grid,
// generating a channel of the same name.
export function sampler(name, options = {}) {
  const {[name]: value} = options;
  if (typeof value !== "function") return options;
  return initializer({...options, [name]: undefined}, function (data, facets, {x1, y1, x2, y2}, {x, y}) {
    // TODO Allow projections, if invertible.
    if (!x) throw new Error("missing scale: x");
    if (!y) throw new Error("missing scale: y");
    let {width: w, height: h} = options;
    const {pixelSize} = this;
    (x1 = x(x1.value[0])), (y1 = y(y1.value[0])), (x2 = x(x2.value[0])), (y2 = y(y2.value[0]));
    // Note: this must exactly match the defaults in render above!
    if (w === undefined) w = Math.round(Math.abs(x2 - x1) / pixelSize);
    if (h === undefined) h = Math.round(Math.abs(y2 - y1) / pixelSize);
    const kx = (x2 - x1) / w;
    const ky = (y2 - y1) / h;
    (x1 += kx / 2), (y1 += ky / 2);
    const V = new Array(w * h);
    for (let yi = 0, i = 0; yi < h; ++yi) {
      for (let xi = 0; xi < w; ++xi, ++i) {
        V[i] = value(x.invert(x1 + xi * kx), y.invert(y1 + yi * ky));
      }
    }
    return {data: V, facets, channels: {[name]: {value: V, scale: true}}};
  });
}

function maybeInterpolate(interpolate) {
  if (typeof interpolate === "function") return interpolate;
  if (interpolate == null) return interpolateNone;
  switch (`${interpolate}`.toLowerCase()) {
    case "none":
      return interpolateNone;
    case "nearest":
      return interpolateNearest;
    case "barycentric":
      return interpolateBarycentric;
    case "random-walk":
      return interpolateRandomWalk;
  }
  throw new Error(`invalid interpolate: ${interpolate}`);
}

// Applies a simple forward mapping of samples, binning them into pixels without
// any blending or interpolation. Note: if multiple samples map to the same
// pixel, the last one wins; this can introduce bias if the points are not in
// random order, so use Plot.shuffle to randomize the input if needed.
function interpolateNone(index, width, height, X, Y, V) {
  const W = new Array(width * height);
  for (const i of index) {
    if (X[i] < 0 || X[i] >= width || Y[i] < 0 || Y[i] >= height) continue;
    W[Math.floor(Y[i]) * width + Math.floor(X[i])] = V[i];
  }
  return W;
}

const ex = Symbol("extrapolate");

function interpolateBarycentric(index, width, height, X, Y, V) {
  const random = randomLcg(42); // TODO allow configurable rng?

  // renumber/reindex everything because we’re going to add points
  index = Array.from(index);
  let i = index.length;
  X = take(X, index);
  Y = take(Y, index);
  V = take(V, index);

  // to extrapolate, we need to fill the rectangle; pad the perimeter with vertices all around
  const addPoint = (x, y) => ((X[i] = x), (Y[i] = y), (V[i] = ex), index.push(i++));
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
  const mix2 = mixer2(V, random);
  for (let i = 0; i < triangles.length; i += 3) {
    const a = triangles[i];
    const b = triangles[i + 1];
    const c = triangles[i + 2];
    if (V[a] === ex) V[a] = V[c] === ex ? V[b] : V[b] === ex ? V[c] : mix2(V[c], V[b]);
    if (V[b] === ex) V[b] = V[a] === ex ? V[c] : V[c] === ex ? V[a] : mix2(V[a], V[c]);
    if (V[c] === ex) V[c] = V[b] === ex ? V[a] : V[a] === ex ? V[b] : mix2(V[b], V[a]);
  }

  // Interpolate the interior of all triangles with barycentric coordinates
  const W = new Array(width * height);
  const mix3 = mixer3(V, random);
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
        if (ga < 0) continue;
        const gb = ((Cy - Ay) * (xp - Cx) + (yp - Cy) * (Ax - Cx)) / z;
        if (gb < 0) continue;
        const gc = 1 - ga - gb;
        if (gc < 0) continue;
        W[x + width * y] = mix3(V[ia], ga, V[ib], gb, V[ic], gc);
      }
    }
  }
  return W;
}

function interpolateNearest(index, width, height, X, Y, V) {
  const W = new V.constructor(width * height);
  const delaunay = Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
  // memoization of delaunay.find for the line start (iy) and pixel (ix)
  let iy, ix;
  for (let y = 0.5, k = 0; y < height; ++y) {
    ix = iy;
    for (let x = 0.5; x < width; ++x, ++k) {
      ix = delaunay.find(x, y, ix);
      if (x === 0.5) iy = ix;
      W[k] = V[index[ix]];
    }
  }
  return W;
}

// TODO adaptive supersampling in areas of high variance?
// TODO configurable iterations per sample (currently 1 + 2)
// see https://observablehq.com/@observablehq/walk-on-spheres-precision
function interpolateRandomWalk(index, width, height, X, Y, V) {
  const W = new V.constructor(width * height);
  const random = randomLcg(42); // TODO allow configurable rng?
  const delaunay = Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  );
  // memoization of delaunay.find for the line start (iy), pixel (ix), and wos step (iw)
  let iy, ix, iw;
  for (let y = 0.5, k = 0; y < height; ++y) {
    ix = iy;
    for (let x = 0.5; x < width; ++x, ++k) {
      let cx = x;
      let cy = y;
      iw = ix = delaunay.find(cx, cy, ix);
      if (x === 0.5) iy = ix;
      let distance; // distance to closest sample
      let step = 0; // count of steps for this walk
      while ((distance = Math.hypot(X[index[iw]] - cx, Y[index[iw]] - cy)) > 0.5 && step < 2) {
        const angle = random() * 2 * Math.PI;
        cx += Math.cos(angle) * distance;
        cy += Math.sin(angle) * distance;
        iw = delaunay.find(cx, cy, iw);
        ++step;
      }
      W[k] = V[index[iw]];
    }
  }
  return W;
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
