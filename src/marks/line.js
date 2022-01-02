import {create, group, line as shapeLine} from "d3";
import {Curve} from "../curve.js";
import {defined, filter, positive} from "../defined.js";
import {Mark, indexOf, identity, maybeNumber, maybeTuple, maybeZ} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles, offset} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeMiterlimit: 1
};

export class Line extends Mark {
  constructor(data, options = {}) {
    const {x, y, curve, tension, r} = options;
    const [vr, cr] = maybeNumber(r);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.curve = Curve(curve, tension);
    this.cr = cr;
  }
  render(I, {x, y}, channels) {
    const {x: X, y: Y, z: Z, r: R} = channels;
    const {dx, dy, cr} = this;
    if (R || cr) {
      return create("svg:g")
      .call(applyIndirectStyles, this)
      .call(applyTransform, x, y, offset + dx, offset + dy)
      .call(g => g.selectAll()
        .data(Z ? group(I, i => Z[i]).values() : [I])
        .join("g")
          .call(g => g.append("path")
            .attr("fill", "none")
            .call(applyDirectStyles, {...this, fill: "none"})
            .call(applyGroupedChannelStyles, channels)
            .attr("d", shapeLine()
              .curve(this.curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => X[i])
              .y(i => Y[i])))
          .call(g => g.selectAll("circle")
            .data(d => R ? filter(d, X, Y).filter(i => positive(R[i])) : filter(d, X, Y))
            .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", i => X[i])
            .attr("cy", i => Y[i])
            .attr("r", R ? i => R[i] : cr)
            .call(applyChannelStyles, channels))
      )
      .node();
    }
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, channels)
            .attr("d", shapeLine()
              .curve(this.curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => X[i])
              .y(i => Y[i])))
      .node();
  }
}

export function line(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Line(data, {...options, x, y});
}

export function lineX(data, {x = identity, y = indexOf, ...options} = {}) {
  return new Line(data, {...options, x, y});
}

export function lineY(data, {x = indexOf, y = identity, ...options} = {}) {
  return new Line(data, {...options, x, y});
}
