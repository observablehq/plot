import {max, min, rgb} from "d3";
import {create} from "../context.js";
import {map, first, second, third, isTuples} from "../options.js";
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
      pixelRatio = 1,
      fill,
      fillOpacity,
      interpolate = interpolateNone
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
    this.pixelRatio = number(pixelRatio, "pixelRatio");
    this.imageRendering = impliedString(imageRendering, "auto");
    this.interpolate = interpolate;
  }
  // Ignore the color scale, so the fill channel is returned as unscaled values.
  scale(channels, {color, ...scales}, context) {
    return super.scale(channels, scales, context);
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, fill: F, fillOpacity: FO} = channels;
    let {x1, y1, x2, y2} = channels;
    x1 = x1 ? x1[0] : min(X);
    x2 = x2 ? x2[0] : max(X);
    y1 = y1 ? y1[0] : min(Y);
    y2 = y2 ? y2[0] : max(Y);
    const {document} = context;
    const imageWidth = Math.abs(x2 - x1);
    const imageHeight = Math.abs(y2 - y1);
    const {
      pixelRatio,
      width = Math.round(imageWidth / pixelRatio),
      height = Math.round(imageHeight / pixelRatio),
      imageRendering
    } = this;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    if (X && Y) {
      // If X and Y are given, then assign each sample to the corresponding
      // pixel location. In the future, it would be better to allow different
      // interpolation methods here, as the current approach will often lead to
      // a sparse image when not every pixel has a corresponding sample.
      const kx = width / imageWidth;
      const ky = height / imageHeight;
      if (x2 < x1) [x2, x1] = [x1, x2];
      if (y2 < y1) [y2, y1] = [y1, y2];
      this.interpolate(index, canvas, scales, channels, {
        x: map(X, (x) => (x - x1) * kx, Float64Array),
        y: map(Y, (y) => (y - y1) * ky, Float64Array)
      });
    } else {
      // Otherwise if X and Y are not given, then assume that F is a dense array
      // of samples covering the entire grid in row-major order. In this case,
      // the order of x1-x2 and y1-y2 matters, as the grid starts in x1, y1.
      const context2d = canvas.getContext("2d");
      const image = context2d.createImageData(width, height);
      const imageData = image.data;
      const {color} = scales;
      let {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
      let a = (this.fillOpacity ?? 1) * 255;
      for (let i = 0, n = width * height; i < n; ++i) {
        const j = i << 2;
        if (F) {
          const fi = F[i];
          if (fi == null) {
            imageData[j + 3] = 0;
            continue;
          }
          ({r, g, b} = rgb(color(fi)));
        }
        if (FO) a = FO[i] * 255;
        imageData[j + 0] = r;
        imageData[j + 1] = g;
        imageData[j + 2] = b;
        imageData[j + 3] = a;
      }
      context2d.putImageData(image, 0, 0);
    }
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
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
function sampleFill({fill, fillOpacity, pixelRatio = 1, ...options} = {}) {
  if (typeof fill !== "function") (options.fill = fill), (fill = null);
  if (typeof fillOpacity !== "function") (options.fillOpacity = fillOpacity), (fillOpacity = null);
  return initializer(options, (data, facets, {x1, y1, x2, y2}, {x, y}) => {
    // TODO Allow projections, if invertible.
    if (!x) throw new Error("missing scale: x");
    if (!y) throw new Error("missing scale: y");
    let {width: w, height: h} = options;
    (x1 = x(x1.value[0])), (y1 = y(y1.value[0])), (x2 = x(x2.value[0])), (y2 = y(y2.value[0]));
    // Note: this must exactly match the defaults in render above!
    if (w === undefined) w = Math.round(Math.abs(x2 - x1) / pixelRatio);
    if (h === undefined) h = Math.round(Math.abs(y2 - y1) / pixelRatio);
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

function interpolateNone(index, canvas, {color}, {fill: F, fillOpacity: FO}, {x: X, y: Y}) {
  let {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
  let a = (this.fillOpacity ?? 1) * 255;
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
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
