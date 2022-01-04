import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, maybeNumber, maybeTuple, keyword} from "../mark.js";
import {radians} from "../math.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  fill: null,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round"
};

export class Vector extends Mark {
  constructor(data, options = {}) {
    const {x, y, length, rotate, anchor = "middle"} = options;
    const [vl, cl] = maybeNumber(length, 12);
    const [vr, cr] = maybeNumber(rotate, 0);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "length", value: vl, optional: true},
        {name: "rotate", value: vr, optional: true}
      ],
      options,
      defaults
    );
    this.length = cl;
    this.rotate = cr;
    this.anchor = keyword(anchor, "anchor", ["start", "middle", "end"]);
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, length: L, rotate: R} = channels;
    const {dx, dy, length, rotate, anchor} = this;
    const index = filter(I, X, Y, L, R);
    const fl = L ? i => L[i] : () => length;
    const fr = R ? i => R[i] : () => rotate;
    const fx = X ? i => X[i] : () => (marginLeft + width - marginRight) / 2;
    const fy = Y ? i => Y[i] : () => (marginTop + height - marginBottom) / 2;
    const k = anchor === "start" ? 0 : anchor === "end" ? 1 : 0.5;
    return create("svg:g")
        .attr("fill", "none")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => {
              const l = fl(i), r = l / 5, a = fr(i) * radians;
              const s = Math.sin(a), sl = s * l, sr = s * r;
              const c = Math.cos(a), cl = c * l, cr = c * r;
              return `M${fx(i) - sl * k},${fy(i) + cl * k}l${sl},${-cl}m${-cr - sr},${cr - sr}l${cr + sr},${sr - cr}l${cr - sr},${sr + cr}`;
            })
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function vector(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Vector(data, {...options, x, y});
}

export function vectorX(data, {x = identity, ...options} = {}) {
  return new Vector(data, {...options, x});
}

export function vectorY(data, {y = identity, ...options} = {}) {
  return new Vector(data, {...options, y});
}
