import {rgb} from "d3";
import {create} from "../context.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "raster",
  stroke: null
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
      interpolate = interpolatePixel
    } = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: [number(x1, "x1")], scale: "x", filter: null},
        y1: {value: [number(y1, "y1")], scale: "y", filter: null},
        x2: {value: [number(x2, "x2")], scale: "x", filter: null},
        y2: {value: [number(y2, "y2")], scale: "y", filter: null}
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
  render(index, scales, channels, dimensions, context) {
    let {x: X, y: Y, fill: F, fillOpacity: FO} = channels;
    const {x1: [x1], y1: [y1], x2: [x2], y2: [y2]} = channels; // prettier-ignore
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
    const {r, g, b} = rgb(this.fill) ?? {r: 0, g: 0, b: 0};
    const a = (this.fillOpacity ?? 1) * 255;
    if (X && Y) {
      // If X and Y are given, then assign each sample to the corresponding
      // pixel location. In the future, it would be better to allow different
      // interpolation methods here, as the current approach will often lead to
      // a sparse image when not every pixel has a corresponding sample.
      const kx = width / imageWidth;
      const ky = height / imageHeight;
      X = X.slice(); // useless copy unless facets are overlapping; could be a Uint16
      Y = Y.slice();
      const R = F ? new Uint8Array(F.length) : undefined;
      const G = F ? new Uint8Array(F.length) : undefined;
      const B = F ? new Uint8Array(F.length) : undefined;
      for (const i of index) {
        X[i] = (X[i] - x1) * kx;
        Y[i] = (Y[i] - y2) * ky;
        if (F) {
          const {r, g, b} = rgb(F[i]);
          R[i] = r;
          G[i] = g;
          B[i] = b;
        }
      }
      this.interpolate(index, canvas, {X, Y, R, G, B, FO}, {r, g, b, a});
    } else {
      // Otherwise if X and Y are not given, then assume that F is a dense array
      // of samples covering the entire grid in row-major order.
      const context2d = canvas.getContext("2d");
      const image = context2d.createImageData(width, height);
      const imageData = image.data;
      for (let y = 0, i = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, ++i) {
          const j = i << 2;
          if (F) {
            const fi = F[i];
            if (fi == null) {
              imageData[j + 3] = 0;
              continue;
            }
            const {r, g, b} = rgb(fi);
            imageData[j + 0] = r;
            imageData[j + 1] = g;
            imageData[j + 2] = b;
          } else {
            imageData[j + 0] = r;
            imageData[j + 1] = g;
            imageData[j + 2] = b;
          }
          imageData[j + 3] = FO ? FO[i] * 255 : a;
        }
      }
      context2d.putImageData(image, 0, 0);
    }
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .append("image")
          .attr("transform", `translate(${x1},${y2}) scale(${Math.sign(x2 - x1)},${Math.sign(y1 - y2)})`)
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
  return new Raster(data, options);
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
    const ky = (y1 - y2) / h;
    (x1 += kx / 2), (y2 += ky / 2);
    let F, FO;
    if (fill) {
      F = new Array(w * h);
      for (let yi = 0, i = 0; yi < h; ++yi) {
        for (let xi = 0; xi < w; ++xi, ++i) {
          F[i] = fill(x.invert(x1 + xi * kx), y.invert(y2 + yi * ky));
        }
      }
    }
    if (fillOpacity) {
      FO = new Array(w * h);
      for (let yi = 0, i = 0; yi < h; ++yi) {
        for (let xi = 0; xi < w; ++xi, ++i) {
          FO[i] = fillOpacity(x.invert(x1 + xi * kx), y.invert(y2 + yi * ky));
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

function interpolatePixel(index, canvas, {X, Y, R, G, B, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context2d = canvas.getContext("2d");
  const image = context2d.createImageData(width, height);
  const imageData = image.data;
  for (const i of index) {
    if (X[i] < 0 || X[i] >= width || Y[i] < 0 || Y[i] >= height) continue;
    const j = (Math.floor(Y[i]) * width + Math.floor(X[i])) << 2;
    if (R) {
      imageData[j + 0] = R[i];
      imageData[j + 1] = G[i];
      imageData[j + 2] = B[i];
    } else {
      imageData[j + 0] = r;
      imageData[j + 1] = g;
      imageData[j + 2] = b;
    }
    imageData[j + 3] = FO ? FO[i] * 255 : a;
    context2d.putImageData(image, 0, 0);
  }
}
