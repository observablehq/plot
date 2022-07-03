import {create} from "../context.js";
import {number} from "../options.js";
import {Mark} from "../plot.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {sqrt4_3} from "../symbols.js";
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
    super(undefined, undefined, {clip, ...options}, defaults);
    this.binWidth = number(binWidth);
  }
  render(index, scales, channels, dimensions, context) {
    const {binWidth} = this;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const x0 = marginLeft - ox, x1 = width - marginRight - ox, y0 = marginTop - oy, y1 = height - marginBottom - oy;
    const rx = binWidth / 2, ry = rx * sqrt4_3, hy = ry / 2, wx = rx * 2, wy = ry * 1.5;
    const path = `m0,${-ry}l${rx},${hy}v${ry}l${-rx},${hy}`;
    const i0 = Math.floor(x0 / wx), i1 = Math.ceil(x1 / wx);
    const j0 = Math.floor((y0 + hy) / wy), j1 = Math.ceil((y1 - hy) / wy) + 1;
    const m = [];
    for (let j = j0; j < j1; ++j) {
      for (let i = i0; i < i1; ++i) {
        m.push(`M${i * wx + (j & 1) * rx},${j * wy}${path}`);
      }
    }
    return create("svg:g", context)
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(g => g.append("path")
          .call(applyDirectStyles, this)
          .call(applyTransform, this, {}, offset + ox, offset + oy)
          .attr("d", m.join("")))
      .node();
  }
}
