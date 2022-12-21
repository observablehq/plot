import {rgb} from "d3";
import {create} from "../context.js";
import {string} from "../options.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "image data",
  stroke: null
};

// TODO
// - an image data channel?
// - verify that fill is width * height array? allow function?
// - allow or disallow fill-opacity, opacity channels?
// - faceting?
// - optimize application of scale as RGB
export class ImageData extends Mark {
  constructor(options = {}) {
    let {x1, y1, x2, y2, width, height, fill, imageRendering = "pixelated"} = options;
    if (x1 == null) throw new Error("missing x1");
    if (y1 == null) throw new Error("missing y1");
    if (x2 == null) throw new Error("missing x2");
    if (y2 == null) throw new Error("missing y2");
    if (width == null) throw new Error("missing width");
    if (height == null) throw new Error("missing height");
    super(
      null,
      {
        x: {value: [x1, x2], scale: "x"},
        y: {value: [y1, y2], scale: "y"},
        fill: {value: fill, scale: "color"}
      },
      options,
      defaults
    );
    this.width = +width;
    this.height = +height;
    this.imageRendering = string(imageRendering);
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, fill: F} = channels;
    const [x1, x2] = X;
    const [y1, y2] = Y;
    const {document} = context;
    const {width, height, imageRendering, fillOpacity} = this;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context2d = canvas.getContext("2d");
    if (fillOpacity != null) context2d.globalAlpha = fillOpacity;
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    for (let y = 0, i = 0, j = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x, ++i, j += 4) {
        const f = rgb(F[i]); // TODO hint to scale to generate rgb instead of string
        imageData[j + 0] = f.r;
        imageData[j + 1] = f.g;
        imageData[j + 2] = f.b;
        imageData[j + 3] = 255; // TODO fill opacity?
      }
    }
    context2d.putImageData(image, 0, 0);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .append("image")
          .attr("x", Math.min(x1, x2))
          .attr("y", Math.min(y1, y2))
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

export function imageData(options) {
  return new ImageData(options);
}
