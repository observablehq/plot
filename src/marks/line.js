import {create, group, line as shapeLine} from "d3";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity, maybeTuple, maybeZ} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeMiterlimit: 1
};

export class Line extends Mark {
  constructor(data, options = {}) {
    const {x, y, curve, tension} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.curve = Curve(curve, tension);
  }
  render(I, {x, y}, channels) {
    const {x: X, y: Y, z: Z} = channels;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
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
