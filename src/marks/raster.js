import {blurImage, Delaunay, randomLcg, rgb} from "d3";
import {valueObject} from "../channel.js";
import {create} from "../context.js";
import {map, first, second, third, isTuples, isNumeric, isTemporal, take, identity} from "../options.js";
import {maybeColorChannel, maybeNumberChannel} from "../options.js";
import {Mark} from "../mark.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "raster",
  stroke: null,
  pixelSize: 1
};

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
      x1 = x == null ? 0 : undefined,
      y1 = y == null ? 0 : undefined,
      x2 = x == null ? width : undefined,
      y2 = y == null ? height : undefined,
      pixelSize = defaults.pixelSize,
      blur = 0,
      interpolate
    } = options;
    if (width != null) width = integer(width, "width");
    if (height != null) height = integer(height, "height");
    // These represent the (minimum) bounds of the raster; they are not
    // evaluated for each datum. Also, if x and y are not specified explicitly,
    // then these bounds are used to compute the dense linear grid.
    if (x1 != null) x1 = number(x1, "x1");
    if (y1 != null) y1 = number(y1, "y1");
    if (x2 != null) x2 = number(x2, "x2");
    if (y2 != null) y2 = number(y2, "y2");
    if (x == null && (x1 == null || x2 == null)) throw new Error("missing x");
    if (y == null && (y1 == null || y2 == null)) throw new Error("missing y");
    if (data != null && width != null && height != null) {
      // If x and y are not given, assume the data is a dense array of samples
      // covering the entire grid in row-major order. These defaults allow
      // further shorthand where x and y represent grid column and row index.
      // TODO If we know that the x and y scales are linear, then we could avoid
      // materializing these columns to improve performance.
      if (x === undefined && x1 != null && x2 != null) x = denseX(x1, x2, width, height);
      if (y === undefined && y1 != null && y2 != null) y = denseY(y1, y2, width, height);
    }
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1 == null ? null : [x1], scale: "x", optional: true, filter: null},
        y1: {value: y1 == null ? null : [y1], scale: "y", optional: true, filter: null},
        x2: {value: x2 == null ? null : [x2], scale: "x", optional: true, filter: null},
        y2: {value: y2 == null ? null : [y2], scale: "y", optional: true, filter: null},
        ...channels
      },
      options,
      defaults
    );
    this.width = width;
    this.height = height;
    this.pixelSize = number(pixelSize, "pixelSize");
    this.blur = number(blur, "blur");
    this.interpolate = x == null || y == null ? null : maybeInterpolate(interpolate); // interpolation requires x & y
  }
}

export class Raster extends AbstractRaster {
  constructor(data, options = {}) {
    const {imageRendering} = options;
    if (data == null) {
      const {fill, fillOpacity} = options;
      if (maybeNumberChannel(fillOpacity)[0] !== undefined) options = sampler("fillOpacity", options);
      if (maybeColorChannel(fill)[0] !== undefined) options = sampler("fill", options);
    }
    super(data, undefined, options, defaults);
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  // Ignore the color scale, so the fill channel is returned unscaled.
  scale(channels, {color, ...scales}, context) {
    return super.scale(channels, scales, context);
  }
  render(index, scales, channels, dimensions, context) {
    const color = scales.color ?? ((x) => x);
    const {x: X, y: Y} = channels;
    const {document} = context;
    const [x1, y1, x2, y2] = renderBounds(channels, dimensions, context);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const {pixelSize: k, width: w = Math.round(Math.abs(dx) / k), height: h = Math.round(Math.abs(dy) / k)} = this;
    const n = w * h;

    // Interpolate the samples to fill the raster grid. If interpolate is null,
    // then a continuous function is being sampled, and the raster grid is
    // already aligned with the canvas.
    let {fill: F, fillOpacity: FO} = channels;
    let offset = 0;
    if (this.interpolate) {
      const kx = w / dx;
      const ky = h / dy;
      const IX = map(X, (x) => (x - x1) * kx, Float64Array);
      const IY = map(Y, (y) => (y - y1) * ky, Float64Array);
      if (F) F = this.interpolate(index, w, h, IX, IY, F);
      if (FO) FO = this.interpolate(index, w, h, IX, IY, FO);
    }

    // When faceting without interpolation, as when sampling a continuous
    // function, offset into the dense grid based on the current facet index.
    else if (this.data == null && index) offset = index.fi * n;

    // Render the raster grid to the canvas, blurring if needed.
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(w, h);
    const imageData = image.data;
    let {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
    let a = (this.fillOpacity ?? 1) * 255;
    for (let i = 0; i < n; ++i) {
      const j = i << 2;
      if (F) {
        const fi = color(F[i + offset]);
        if (fi == null) {
          imageData[j + 3] = 0;
          continue;
        }
        ({r, g, b} = rgb(fi));
      }
      if (FO) a = FO[i + offset] * 255;
      imageData[j + 0] = r;
      imageData[j + 1] = g;
      imageData[j + 2] = b;
      imageData[j + 3] = a;
    }
    if (this.blur > 0) blurImage(image, this.blur);
    context2d.putImageData(image, 0, 0);

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .append("image")
          .attr("transform", `translate(${x1},${y1}) scale(${Math.sign(x2 - x1)},${Math.sign(y2 - y1)})`)
          .attr("width", Math.abs(dx))
          .attr("height", Math.abs(dy))
          .attr("preserveAspectRatio", "none")
          .call(applyAttr, "image-rendering", this.imageRendering)
          .call(applyDirectStyles, this)
          .attr("xlink:href", canvas.toDataURL())
      )
      .node();
  }
}

export function maybeTuples(k, data, options) {
  if (arguments.length < 3) (options = data), (data = null);
  let {x, y, [k]: z, ...rest} = options;
  // Because we use implicit x and y when z is a function of (x, y), and when
  // data is a dense grid, we must further disambiguate by testing whether data
  // contains [x, y, z?] tuples. Hence you can’t use this shorthand with a
  // transform that lazily generates tuples, but that seems reasonable since
  // this is just for convenience anyway.
  if (x === undefined && y === undefined && isTuples(data)) {
    (x = first), (y = second);
    if (z === undefined) z = third;
  }
  return [data, {...rest, x, y, [k]: z}];
}

/** @jsdoc raster */
export function raster() {
  const [data, options] = maybeTuples("fill", ...arguments);
  return new Raster(
    data,
    data == null || options.fill !== undefined || options.fillOpacity !== undefined
      ? options
      : {...options, fill: identity}
  );
}

// See rasterBounds; this version is called during render.
function renderBounds({x1, y1, x2, y2}, dimensions, {projection}) {
  const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
  return [
    x1 && projection == null ? x1[0] : marginLeft,
    y1 && projection == null ? y1[0] : marginTop,
    x2 && projection == null ? x2[0] : width - marginRight,
    y2 && projection == null ? y2[0] : height - marginBottom
  ];
}

// If x1, y1, x2, y2 were specified, and no projection is in use (and thus the
// raster grid is necessarily an axis-aligned rectangle), then we can compute
// tighter bounds for the image, improving resolution.
export function rasterBounds({x1, y1, x2, y2}, scales, dimensions, context) {
  const channels = {};
  if (x1) channels.x1 = x1;
  if (y1) channels.y1 = y1;
  if (x2) channels.x2 = x2;
  if (y2) channels.y2 = y2;
  return renderBounds(valueObject(channels, scales), dimensions, context);
}

// Evaluates the function with the given name, if it exists, on the raster grid,
// generating a channel of the same name.
export function sampler(name, options = {}) {
  const {[name]: value} = options;
  if (typeof value !== "function") throw new Error(`invalid ${name}: not a function`);
  return initializer({...options, [name]: undefined}, function (data, facets, channels, scales, dimensions, context) {
    const {x, y} = scales;
    // TODO Allow projections, if invertible.
    if (!x) throw new Error("missing scale: x");
    if (!y) throw new Error("missing scale: y");
    const [x1, y1, x2, y2] = rasterBounds(channels, scales, dimensions, context);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const {pixelSize: k} = this;
    // Note: this must exactly match the defaults in render above!
    const {width: w = Math.round(Math.abs(dx) / k), height: h = Math.round(Math.abs(dy) / k)} = options;
    // TODO Hint to use a typed array when possible?
    const V = new Array(w * h * (facets ? facets.length : 1));
    const kx = dx / w;
    const ky = dy / h;
    let i = 0;
    for (const facet of facets ?? [undefined]) {
      for (let yi = 0.5; yi < h; ++yi) {
        for (let xi = 0.5; xi < w; ++xi, ++i) {
          V[i] = value(x.invert(x1 + xi * kx), y.invert(y1 + yi * ky), facet);
        }
      }
    }
    return {data: V, facets, channels: {[name]: {value: V, scale: "auto"}}};
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
      return interpolatorBarycentric();
    case "random-walk":
      return interpolatorRandomWalk();
  }
  throw new Error(`invalid interpolate: ${interpolate}`);
}

// Applies a simple forward mapping of samples, binning them into pixels without
// any blending or interpolation. Note: if multiple samples map to the same
// pixel, the last one wins; this can introduce bias if the points are not in
// random order, so use Plot.shuffle to randomize the input if needed.
/** @jsdoc interpolateNone */
export function interpolateNone(index, width, height, X, Y, V) {
  const W = new Array(width * height);
  for (const i of index) {
    if (X[i] < 0 || X[i] >= width || Y[i] < 0 || Y[i] >= height) continue;
    W[Math.floor(Y[i]) * width + Math.floor(X[i])] = V[i];
  }
  return W;
}

/** @jsdoc interpolatorBarycentric */
export function interpolatorBarycentric({random = randomLcg(42)} = {}) {
  return (index, width, height, X, Y, V) => {
    // Flatten the input coordinates to prepare to insert extrapolated points
    // along the perimeter of the grid (so there’s no blank output).
    const n = index.length;
    const nw = width >> 2;
    const nh = (height >> 2) - 1;
    const m = n + nw * 2 + nh * 2;
    const XY = new Float64Array(m * 2);
    for (let i = 0; i < n; ++i) (XY[i * 2] = X[index[i]]), (XY[i * 2 + 1] = Y[index[i]]);

    // Add points along each edge, making sure to include the four corners for
    // complete coverage (with no chamfered edges).
    let i = n;
    const addPoint = (x, y) => ((XY[i * 2] = x), (XY[i * 2 + 1] = y), i++);
    for (let j = 0; j <= nw; ++j) addPoint((j / nw) * width, 0), addPoint((j / nw) * width, height);
    for (let j = 0; j < nh; ++j) addPoint(width, (j / nh) * height), addPoint(0, (j / nh) * height);

    // To each edge point, assign the closest (non-extrapolated) value.
    V = take(V, index);
    const delaunay = new Delaunay(XY.subarray(0, n * 2));
    for (let j = n, ij; j < m; ++j) V[j] = V[(ij = delaunay.find(XY[j * 2], XY[j * 2 + 1], ij))];

    // Interpolate the interior of all triangles with barycentric coordinates
    const {points, triangles} = new Delaunay(XY);
    const W = new V.constructor(width * height);
    const mix = mixer(V, random);
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
      const va = V[ta];
      const vb = V[tb];
      const vc = V[tc];
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
          W[x + width * y] = mix(va, ga, vb, gb, vc, gc, x, y);
        }
      }
    }
    return W;
  };
}

/** @jsdoc interpolateNearest */
export function interpolateNearest(index, width, height, X, Y, V) {
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

// https://observablehq.com/@observablehq/walk-on-spheres-precision
/** @jsdoc interpolatorRandomWalk */
export function interpolatorRandomWalk({random = randomLcg(42), minDistance = 0.5, maxSteps = 2} = {}) {
  return (index, width, height, X, Y, V) => {
    const W = new V.constructor(width * height);
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
        while ((distance = Math.hypot(X[index[iw]] - cx, Y[index[iw]] - cy)) > minDistance && step < maxSteps) {
          const angle = random(x, y, step) * 2 * Math.PI;
          cx += Math.cos(angle) * distance;
          cy += Math.sin(angle) * distance;
          iw = delaunay.find(cx, cy, iw);
          ++step;
        }
        W[k] = V[index[iw]];
      }
    }
    return W;
  };
}

function blend(a, ca, b, cb, c, cc) {
  return ca * a + cb * b + cc * c;
}

function pick(random) {
  return (a, ca, b, cb, c, cc, x, y) => {
    const u = random(x, y);
    return u < ca ? a : u < ca + cb ? b : c;
  };
}

function mixer(F, random) {
  return isNumeric(F) || isTemporal(F) ? blend : pick(random);
}

function denseX(x1, x2, width) {
  return {
    transform(data) {
      const n = data.length;
      const X = new Float64Array(n);
      const kx = (x2 - x1) / width;
      const x0 = x1 + kx / 2;
      for (let i = 0; i < n; ++i) X[i] = (i % width) * kx + x0;
      return X;
    }
  };
}

function denseY(y1, y2, width, height) {
  return {
    transform(data) {
      const n = data.length;
      const Y = new Float64Array(n);
      const ky = (y2 - y1) / height;
      const y0 = y1 + ky / 2;
      for (let i = 0; i < n; ++i) Y[i] = (Math.floor(i / width) % height) * ky + y0;
      return Y;
    }
  };
}
