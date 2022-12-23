import {rgb} from "d3";
import {create} from "../context.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "image data",
  stroke: null
};

export class Raster extends Mark {
  constructor(data, options = {}) {
    let {
      width,
      height,
      x,
      y,
      x1 = x == null ? 0 : undefined,
      y1 = y == null ? 0 : undefined,
      x2 = x == null ? width : undefined,
      y2 = y == null ? height : undefined,
      imageRendering,
      fill
    } = options;
    if (data == null && typeof fill === "function") {
      data = new Array(width * height);
      options = initializer(options, sampleFill(x1, y1, x2, y2, width, height, fill));
    }
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
      options,
      defaults
    );
    this.width = width === undefined ? undefined : Math.floor(width);
    this.height = height === undefined ? undefined : Math.floor(height);
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, fill: F} = channels;
    if (!F) return;
    const {x1: [x1], y1: [y1], x2: [x2], y2: [y2]} = channels; // prettier-ignore
    const {document} = context;
    const imageWidth = Math.round(Math.abs(x2 - x1));
    const imageHeight = Math.round(Math.abs(y2 - y1));
    const {width: canvasWidth = imageWidth, height: canvasHeight = imageHeight, imageRendering} = this;
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(canvasWidth, canvasHeight);
    const imageData = image.data;
    if (X && Y) {
      const kx = canvasWidth / imageWidth;
      const ky = canvasHeight / imageHeight;
      for (const i of index) {
        const xi = Math.floor((X[i] - x1) * kx);
        if (xi < 0 || xi >= canvasWidth) continue;
        const yi = Math.floor((Y[i] - y2) * ky);
        if (yi < 0 || yi >= canvasHeight) continue;
        const {r, g, b} = rgb(F[i]);
        const j = (yi * canvasWidth + xi) << 2;
        imageData[j + 0] = r;
        imageData[j + 1] = g;
        imageData[j + 2] = b;
        imageData[j + 3] = 255;
      }
    } else {
      // If X and Y are not given, then assume that F is a dense array of
      // samples covering the entire grid in row-major order.
      for (let y = 0, i = 0; y < canvasHeight; ++y) {
        for (let x = 0; x < canvasWidth; ++x, ++i) {
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
          .attr("width", Math.abs(x2 - x1))
          .attr("height", Math.abs(y2 - y1))
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
function sampleFill(x1, y1, x2, y2, width, height, f) {
  return (data, facets, channels, {x, y}) => {
    (x1 = x(x1)), (y1 = y(y1)), (x2 = x(x2)), (y2 = y(y2));
    const kx = (x2 - x1) / width;
    const ky = (y1 - y2) / height;
    (x1 += kx / 2), (y2 += ky / 2);
    const F = new Array(width * height);
    for (let yi = 0, i = 0; yi < height; ++yi) {
      for (let xi = 0; xi < width; ++xi, ++i) {
        F[i] = f(x.invert(x1 + xi * kx), y.invert(y2 + yi * ky));
      }
    }
    return {data, facets, channels: {fill: {value: F, scale: "color"}}};
  };
}
