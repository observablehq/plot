import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, anchorPosition, maybeAnchor, identity, maybeNumber, maybeTuple} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, anchor} = options;
    const [vr, cr] = maybeNumber(r, 3);
    const [vx, cx] = maybeNumber(x, 0);
    const [vy, cy] = maybeNumber(y, 0);
    super(
      data,
      [
        {name: "x", value: vx, scale: "x", optional: true},
        {name: "y", value: vy, scale: "y", optional: true},
        {name: "r", value: vr, scale: "r", optional: true}
      ],
      options,
      defaults
    );
    this.cx = cx;
    this.cy = cy;
    this.anchor = maybeAnchor(anchor);
    this.r = cr;
  }
  render(
    I,
    {x, y},
    channels,
    dimensions
  ) {
    const {x: X, y: Y, r: R} = channels;
    const {dx, dy} = this;
    const [cx, cy] = anchorPosition(dimensions, this.anchor, this.cx, this.cy);
    let index = filter(I, X, Y);
    if (R) index = index.filter(i => positive(R[i]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", X ? i => X[i] : cx)
            .attr("cy", Y ? i => Y[i] : cy)
            .attr("r", R ? i => R[i] : this.r)
            .call(applyChannelStyles, channels))
      .node();
  }
}

export function dot(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, y});
}
