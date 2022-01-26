import {create} from "d3";
import {radians} from "../math.js";
import {positive} from "../defined.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeSymbolChannel, maybeTuple, keyword} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  fill: null,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round"
};

export class Vector extends Mark {
  constructor(data, options = {}) {
    const {x, y, length, rotate, anchor = "middle", frameAnchor, symbol, r} = options;
    const [vl, cl] = maybeNumberChannel(length, 12);
    const [vr, cr] = maybeNumberChannel(rotate, 0);

    // compute the r channel if present, as it might be used by a layout (such as dodgeY)
    const [vsymbol] = maybeSymbolChannel(symbol);
    const [vradius] = maybeNumberChannel(r, vsymbol == null ? 3 : 4.5);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "r", value: vradius, scale: "r", filter: positive, optional: true},
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
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return new Vector(data, {...options, x, y});
}
