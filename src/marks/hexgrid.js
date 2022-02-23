import {create} from "d3";
import {Mark} from "../plot.js";
import {number} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

// width factor (allows the hexbin transform to work with circular dots!)
const w0 = Math.sin(Math.PI / 3);

const defaultsMesh = {
  ariaLabel: "hexagonal mesh",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 0.25
};

export function hexgrid(options) {
  return new Hexgrid(options);
}

export class Hexgrid extends Mark {
  constructor({radius = 10, clip = true, ...options} = {}) {
    super(undefined, undefined, {clip, ...options}, defaultsMesh);
    this.radius = number(radius);
  }
  render(I, scales, channels, dimensions) {
    const {dx, dy, radius} = this;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(g => g.append("path")
          .call(applyDirectStyles, this)
          .call(applyTransform, null, null, offset + dx, offset + dy)
          .attr("d", mesh(radius, marginLeft, width - marginRight, marginTop, height - marginBottom)))
      .node();
  }
}

function mesh(r, x0, x1, y0, y1) {
  const dx = r * 2 * w0;
  const dy = r * 1.5;
  x1 += dx / 2;
  y1 += r;
  const fragment = Array.from({length: 4}, (_, i) => [r * Math.sin((i + 1) * Math.PI / 3), r * Math.cos((i + 1) * Math.PI / 3)]).join("l");
  const m = [];
  let j = Math.round(y0 / dy);
  for (let y = dy * j; y < y1; y += dy, ++j) {
    for (let x = (Math.round(x0 / dx) + (j & 1) / 2) * dx; x < x1; x += dx) {
      m.push(`M${x - dx / 2},${y + dy / 3}m${fragment}`);
    }
  }
  return m.join("");
}
