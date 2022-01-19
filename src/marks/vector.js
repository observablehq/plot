import {create} from "d3";
import {radians} from "../math.js";
import {maybeNumberChannel, maybeTuple, keyword} from "../options.js";
import {Mark} from "../plot.js";
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
  }
  render(
    index,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, length: L, rotate: R} = channels;
    const {dx, dy, length, rotate, anchor} = this;
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
  ([x, y] = maybeTuple(x, y));
  return new Vector(data, {...options, x, y});
}
