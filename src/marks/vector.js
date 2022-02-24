import {create} from "d3";
import {radians} from "../math.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeTuple, keyword, identity} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  ariaLabel: "vector",
  fill: null,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round"
};

export class Vector extends Mark {
  constructor(data, options = {}) {
    const {x, y, length, rotate, anchor = "middle", frameAnchor} = options;
    const [vl, cl] = maybeNumberChannel(length, 12);
    const [vr, cr] = maybeNumberChannel(rotate, 0);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "length", value: vl, scale: "length", optional: true},
        {name: "rotate", value: vr, optional: true}
      ],
      options,
      defaults
    );
    this.length = cl;
    this.rotate = cr;
    this.anchor = keyword(anchor, "anchor", ["start", "middle", "end"]);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, length: L, rotate: R} = channels;
    const {dx, dy, length, rotate, anchor} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const fl = L ? i => L[i] : () => length;
    const fr = R ? i => R[i] : () => rotate;
    const fx = X ? i => X[i] : () => cx;
    const fy = Y ? i => Y[i] : () => cy;
    const k = anchor === "start" ? 0 : anchor === "end" ? 1 : 0.5;
    return create("svg:g")
        .attr("fill", "none")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => {
              const l = fl(i), a = fr(i) * radians;
              const x = Math.sin(a) * l, y = -Math.cos(a) * l;
              const d = (x + y) / 5, e = (x - y) / 5;
              return `M${fx(i) - x * k},${fy(i) - y * k}l${x},${y}m${-e},${-d}l${e},${d}l${-d},${e}`;
            })
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function vector(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return new Vector(data, {...options, x, y});
}

export function vectorX(data, {x = identity, ...options} = {}) {
  return new Vector(data, {...options, x});
}

export function vectorY(data, {y = identity, ...options} = {}) {
  return new Vector(data, {...options, y});
}
