import {create} from "../context.js";
import {Mark} from "../mark.js";
import {number, singleton} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {sqrt4_3} from "../symbol.js";
import {ox, oy} from "../transforms/hexbin.js";

const defaults = {
  ariaLabel: "hexgrid",
  fill: "none",
  stroke: "currentColor",
  strokeOpacity: 0.1
};

export function hexgrid(options) {
  return new Hexgrid(options);
}

export class Hexgrid extends Mark {
  constructor({binWidth = 20, clip = true, ...options} = {}) {
    super(singleton, undefined, {clip, ...options}, defaults);
    this.binWidth = number(binWidth);
  }
  render(index, scales, channels, dimensions, context) {
    const {binWidth} = this;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const x0 = marginLeft - ox,
      x1 = width - marginRight - ox,
      y0 = marginTop - oy,
      y1 = height - marginBottom - oy,
      rx = binWidth / 2,
      ry = rx * sqrt4_3,
      hy = ry / 2,
      wx = rx * 2,
      wy = ry * 1.5,
      i0 = Math.floor(x0 / wx),
      i1 = Math.ceil(x1 / wx),
      j0 = Math.floor((y0 + hy) / wy),
      j1 = Math.ceil((y1 - hy) / wy) + 1,
      path = `m0,${round(-ry)}l${round(rx)},${round(hy)}v${round(ry)}l${round(-rx)},${round(hy)}`;
    let d = path;
    for (let j = j0; j < j1; ++j) {
      for (let i = i0; i < i1; ++i) {
        d += `M${round(i * wx + (j & 1) * rx)},${round(j * wy)}${path}`;
      }
    }
    return create("svg:g", context)
      .datum(0)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {}, offset + ox, offset + oy)
      .call((g) => g.append("path").call(applyDirectStyles, this).call(applyChannelStyles, this, channels).attr("d", d))
      .node();
  }
}

function round(x) {
  return Math.round(x * 1e3) / 1e3;
}
