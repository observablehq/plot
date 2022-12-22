import {rgb} from "d3";
import {create} from "../context.js";
import {Mark} from "../plot.js";
import {applyAttr, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";

const defaults = {
  ariaLabel: "image data",
  stroke: null
};

// TODO
// - an image data channel?
// - verify that fill is width * height array? allow function?
// - allow or disallow opacity channel?
// - faceting?
// - enforce that the x and y scales are linear or utc/time?
// - optimize application of scale as RGB
export class ImageData extends Mark {
  constructor(options = {}) {
    let {
      fill,
      width,
      height,
      x1 = 0,
      y1 = 0,
      x2 = width,
      y2 = height,
      offset = 0,
      stride = 1,
      imageRendering
    } = options;
    if (width == null) throw new Error("missing width");
    if (height == null) throw new Error("missing height");
    super(
      null,
      {
        x: {value: [x1, x2], scale: "x"},
        y: {value: [y1, y2], scale: "y"}
      },
      typeof fill === "function" ? {...options, fill: sampleFill(x1, y1, x2, y2, width, height, fill)} : options,
      defaults
    );
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.offset = Math.floor(offset);
    this.stride = Math.floor(stride);
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, fill: F, fillOpacity: FO} = channels;
    const [x1, x2] = X;
    const [y1, y2] = Y;
    const {document} = context;
    const {width, height, offset, stride, imageRendering} = this;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context2d = canvas.getContext("2d");
    const image = context2d.createImageData(width, height);
    const imageData = image.data;
    if (F) {
      for (let y = 0, i = offset, j = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, i += stride, j += 4) {
          const f = F[i];
          if (f == null) continue; // skip missing or invalid data
          const {r, g, b} = rgb(f);
          imageData[j + 0] = r;
          imageData[j + 1] = g;
          imageData[j + 2] = b;
        }
      }
    }
    if (FO) {
      for (let y = 0, i = offset, j = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, i += stride, j += 4) {
          const o = FO[i];
          if (o == null) continue; // skip missing or invalid data
          imageData[j + 3] = o * 255;
        }
      }
    } else {
      const {fillOpacity = 1} = this;
      const o = fillOpacity * 255;
      for (let y = 0, j = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, j += 4) {
          imageData[j + 3] = o;
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
          .attr("transform", `translate(${x1},${y1}) scale(${Math.sign(x2 - x1)},${Math.sign(y2 - y1)})`)
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

// Evaluates the function f at the midpoint of each pixel.
function sampleFill(x1, y1, x2, y2, width, height, f) {
  const kx = (x2 - x1) / width;
  const ky = (y2 - y1) / height;
  x1 += kx / 2;
  x2 += ky / 2;
  return Array.from({length: width * height}, (_, i) => f(x1 + (i % width) * kx, y1 + Math.floor(i / width) * ky, i));
}
