import {create} from "d3";
import {Mark} from "../plot.js";
import {number} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  ariaLabel: "hexgrid",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 0.25
};

export function hexgrid(options) {
  return new Hexgrid(options);
}

export class Hexgrid extends Mark {
  constructor({radius = 10, clip = true, ...options} = {}) {
    super(undefined, undefined, {clip, ...options}, defaults);
    this.radius = number(radius);
  }
  render(I, scales, channels, dimensions) {
    const {dx, dy, radius: r} = this;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const rx = r * 2 * Math.sin(Math.PI / 3); // scaling allows the hexbin transform to work with circular dots!
    const ry = r * 1.5;
    const x0 = marginLeft, x1 = width - marginRight - rx / 2, y0 = marginTop, y1 = height - marginBottom + r + ry / 3;
    const fragment = Array.from({length: 4}, (_, i) => [r * Math.sin((i + 1) * Math.PI / 3), r * Math.cos((i + 1) * Math.PI / 3)]).join("l");
    const m = [];
    for (let j = Math.round(y0 / ry), y = ry * j + ry / 3; y < y1; y += ry, ++j) {
      for (let x = (Math.round(x0 / rx) + (j & 1) / 2) * rx - rx / 2; x < x1; x += rx) {
        m.push(`M${x},${y}m${fragment}`);
      }
    }
    const d = m.join("");
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(g => g.append("path")
          .call(applyDirectStyles, this)
          .call(applyTransform, null, null, offset + dx, offset + dy)
          .attr("d", d))
      .node();
  }
}
