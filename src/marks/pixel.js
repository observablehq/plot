import {create} from "../context.js";
import {map, maybeTuple, number, valueof} from "../options.js";
import {Mark} from "../plot.js";
import {applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "pixel"
};

export class Pixel extends Mark {
  constructor(data, options = {}) {
    const {x, y, inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset} = options;
    let X, Y; // TODO better way of deriving multiple channels from one channel
    super(
      data,
      {
        // TODO configurable radius?
        // TODO enforce quantitative scale?
        // TODO x and y are required channels; detect when they are missing
        // TODO disable unsupported channels e.g. stroke, strokeOpacity
        x1: {value: {transform: (data) => map((X = valueof(data, x)), (x) => x - 0.5)}, scale: "x"},
        y1: {value: {transform: (data) => map((Y = valueof(data, y)), (y) => y - 0.5)}, scale: "y"},
        x2: {value: {transform: () => map(X, (x) => x + 0.5)}, scale: "x"},
        y2: {value: {transform: () => map(Y, (y) => y + 0.5)}, scale: "y"}
      },
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2, y2: Y2, fill: F, fillOpacity: FO} = channels;
    const {insetTop, insetRight, insetBottom, insetLeft} = this;
    const {width, height} = dimensions;
    const {document, devicePixelRatio: k} = context;
    const canvas = document.createElement("canvas");
    canvas.width = width * k;
    canvas.height = height * k;
    const context2d = canvas.getContext("2d");
    if (!F) context2d.fillStyle = this.fill;
    if (!FO) context2d.globalAlpha = this.fillOpacity;
    for (const i of index) {
      // TODO round option?
      // TODO mark-level devicePixelRatio option?
      const x1 = Math.round(k * (Math.min(X1[i], X2[i]) + insetLeft));
      const x2 = Math.round(k * (Math.max(X1[i], X2[i]) - insetRight));
      const y1 = Math.round(k * (Math.min(Y1[i], Y2[i]) + insetTop));
      const y2 = Math.round(k * (Math.max(Y1[i], Y2[i]) - insetBottom));
      if (F) context2d.fillStyle = F[i];
      if (FO) context2d.globalAlpha = FO[i];
      context2d.fillRect(x1, y1, Math.max(0, x2 - x1), Math.max(0, y2 - y1));
    }
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", canvas.toDataURL())
      )
      .node();
  }
}

export function pixel(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Pixel(data, {...remainingOptions, x, y});
}
