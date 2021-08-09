import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, identity, maybeNumber, maybeTuple} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r} = options;
    const [vr, cr] = maybeNumber(r, 3);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "r", value: vr, scale: "r", optional: true}
      ],
      options,
      defaults
    );
    this.r = cr;
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, r: R} = channels;
    let index = filter(I, X, Y);
    if (R) index = index.filter(i => positive(R[i]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("cy", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
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
