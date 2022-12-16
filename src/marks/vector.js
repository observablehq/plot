import {create} from "../context.js";
import {radians} from "../math.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeTuple, keyword, identity} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform
} from "../style.js";

const vectorDefaults = {
  ariaLabel: "vector",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round"
};

export class Vector extends Mark {
  constructor(data, options = {}, defaults = vectorDefaults) {
    const {x, y, length, rotate, anchor = "middle", frameAnchor} = options;
    const [vl, cl] = maybeNumberChannel(length, 12);
    const [vr, cr] = maybeNumberChannel(rotate, 0);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        length: {value: vl, scale: "length", optional: true},
        rotate: {value: vr, optional: true}
      },
      options,
      defaults
    );
    this.length = cl;
    this.rotate = cr;
    this.anchor = keyword(anchor, "anchor", ["start", "middle", "end"]);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  _path(fx, fy, fl, fr, k) {
    const l = fl,
      a = fr * radians,
      x = Math.sin(a) * l,
      y = -Math.cos(a) * l,
      d = (x + y) / 5,
      e = (x - y) / 5;
    return `M${fx - x * k},${fy - y * k}l${x},${y}m${-e},${-d}l${e},${d}l${-d},${e}`;
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, length: L, rotate: R} = channels;
    const {length, rotate, anchor} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const fl = L ? (i) => L[i] : () => length;
    const fr = R ? (i) => R[i] : () => rotate;
    const fx = X ? (i) => X[i] : () => cx;
    const fy = Y ? (i) => Y[i] : () => cy;
    const k = anchor === "start" ? 0 : anchor === "end" ? 1 : 0.5;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (i) => this._path(fx(i), fy(i), fl(i), fr(i), k))
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/** @jsdoc vector */
export function vector(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Vector(data, {...remainingOptions, x, y});
}

/** @jsdoc vectorX */
export function vectorX(data, options = {}) {
  const {x = identity, ...remainingOptions} = options;
  return new Vector(data, {...remainingOptions, x});
}

/** @jsdoc vectorY */
export function vectorY(data, options = {}) {
  const {y = identity, ...remainingOptions} = options;
  return new Vector(data, {...remainingOptions, y});
}
