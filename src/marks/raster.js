import {rgb} from "d3";
import {create} from "../context.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "raster",
  stroke: null
};

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
      x2 = x == null ? width ?? 1 : undefined,
      y2 = y == null ? height ?? 1 : undefined,
      imageRendering,
      pixelRatio = 1,
      fill
    } = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: [+x1], scale: "x", filter: null},
        y1: {value: [+y1], scale: "y", filter: null},
        x2: {value: [+x2], scale: "x", filter: null},
        y2: {value: [+y2], scale: "y", filter: null}
      },
      data == null && typeof fill === "function" ? sampleFill(options) : options,
      defaults
    );
    this.width = width === undefined ? undefined : Math.floor(width);
    this.height = height === undefined ? undefined : Math.floor(height);
    this.pixelRatio = +pixelRatio;
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, fill: F} = channels;
    if (!F) return;
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
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    if (X && Y) {
      // If X and Y are given, then assign each sample to the corresponding
      // pixel location. In the future, it would be better to allow different
      // interpolation methods here, as the current approach will often lead to
      // a sparse image when not every pixel has a corresponding sample.
      const kx = width / imageWidth;
      const ky = height / imageHeight;
      for (const i of index) {
        const xi = Math.floor((X[i] - x1) * kx);
        if (xi < 0 || xi >= width) continue;
        const yi = Math.floor((Y[i] - y2) * ky);
        if (yi < 0 || yi >= height) continue;
        const {r, g, b} = rgb(F[i]);
        const j = (yi * width + xi) << 2;
        imageData[j + 0] = r;
        imageData[j + 1] = g;
        imageData[j + 2] = b;
        imageData[j + 3] = 255;
      }
    } else {
      // Otherwise if X and Y are not given, then assume that F is a dense array
      // of samples covering the entire grid in row-major order.
      for (let y = 0, i = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, ++i) {
          const f = F[i];
          if (f == null) continue;
          const {r, g, b} = rgb(F[i]);
          const j = i << 2;
          imageData[j + 0] = r;
          imageData[j + 1] = g;
          imageData[j + 2] = b;
          imageData[j + 3] = 255;
        }
      }
    }
    context2d.putImageData(image, 0, 0);
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
function sampleFill({fill, pixelRatio = 1, ...options} = {}) {
  return initializer(options, (data, facets, channels, scales, dimensions) => {
    const {x, y} = scales;
    const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
    let {x1, y1, x2, y2, width: w, height: h} = options;
    if (w === undefined) w = Math.max(0, Math.round((width - marginLeft - marginRight) / pixelRatio));
    if (h === undefined) h = Math.max(0, Math.round((height - marginTop - marginBottom) / pixelRatio));
    x1 = x1 == null ? marginLeft : x(x1);
    y1 = y1 == null ? height - marginBottom : y(y1);
    x2 = x2 == null ? width - marginRight : x(x2);
    y2 = y2 == null ? marginTop : y(y2);
    const kx = (x2 - x1) / w;
    const ky = (y1 - y2) / h;
    const xb = x1 + kx / 2;
    const yb = y2 + ky / 2;
    const F = new Array(w * h);
    for (let yi = 0, i = 0; yi < h; ++yi) {
      for (let xi = 0; xi < w; ++xi, ++i) {
        F[i] = fill(x.invert(xb + xi * kx), y.invert(yb + yi * ky));
      }
    }
    return {
      data: F,
      facets,
      channels: {
        fill: {value: F, scale: "color"},
        x1: {value: [x1]},
        x2: {value: [x2]},
        y1: {value: [y1]},
        y2: {value: [y2]}
      }
    };
  });
}
