import {create} from "../context.js";
import {maybeTuple, number, string, valueof} from "../options.js";
import {Mark} from "../plot.js";
import {coerceNumbers} from "../scales.js";
import {applyAttr, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "pixel",
  stroke: null
};

function numberof(data, x) {
  return coerceNumbers(valueof(data, x));
}

function maybeRound(round) {
  if (round === false || round == null) return null;
  if (round === true) return Math.round;
  if (typeof round !== "function") throw new Error(`invalid round: ${round}`);
  return round;
}

export class Pixel extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset,
      pixelRatio,
      imageRendering = "pixelated",
      round = true
    } = options;
    if (x == null) throw new Error("missing channel: x");
    if (y == null) throw new Error("missing channel: y");
    let {r = 0.5, rx = r, ry = r} = options;
    rx = number(rx);
    ry = number(ry);
    let X, Y;
    super(
      data,
      {
        x1: {value: {transform: (data) => (X = numberof(data, x)).map((x) => x - rx)}, scale: "x"},
        y1: {value: {transform: (data) => (Y = numberof(data, y)).map((y) => y - ry)}, scale: "y"},
        x2: {value: {transform: () => X.map((x) => x + rx)}, scale: "x"},
        y2: {value: {transform: () => Y.map((y) => y + ry)}, scale: "y"}
      },
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.pixelRatio = number(pixelRatio);
    this.imageRendering = string(imageRendering);
    this.round = maybeRound(round);
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2, y2: Y2, fill: F, fillOpacity: FO} = channels;
    const {width, height} = dimensions;
    const {document, devicePixelRatio} = context;
    const {insetTop, insetRight, insetBottom, insetLeft, pixelRatio = devicePixelRatio, round} = this;
    const canvas = document.createElement("canvas");
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context2d = canvas.getContext("2d");
    if (!F) context2d.fillStyle = this.fill;
    if (!FO) context2d.globalAlpha = this.fillOpacity;
    for (const i of index) {
      let x1 = pixelRatio * (Math.min(X1[i], X2[i]) + insetLeft),
        x2 = pixelRatio * (Math.max(X1[i], X2[i]) - insetRight),
        y1 = pixelRatio * (Math.min(Y1[i], Y2[i]) + insetTop),
        y2 = pixelRatio * (Math.max(Y1[i], Y2[i]) - insetBottom);
      if (round) (x1 = round(x1)), (x2 = round(x2)), (y1 = round(y1)), (y2 = round(y2));
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
          .call(applyAttr, "image-rendering", this.imageRendering)
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
