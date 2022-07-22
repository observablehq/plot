import {line as shapeLine} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {indexOf, identity, maybeTuple, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyGroupedChannelStyles,
  groupIndex
} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {applyGroupedMarkers, markers} from "./marker.js";

const defaults = {
  ariaLabel: "line",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Line extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, curve, tension} = options;
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y"},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    this.curve = Curve(curve, tension);
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X, Y], this, channels))
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .call(applyGroupedMarkers, this, channels)
          .attr(
            "d",
            shapeLine()
              .curve(this.curve)
              .defined((i) => i >= 0)
              .x((i) => X[i])
              .y((i) => Y[i])
          )
      )
      .node();
  }
}

export function line(data, {x, y, ...options} = {}) {
  [x, y] = maybeTuple(x, y);
  return new Line(data, {...options, x, y});
}

export function lineX(data, {x = identity, y = indexOf, ...options} = {}) {
  return new Line(data, maybeDenseIntervalY({...options, x, y}));
}

export function lineY(data, {x = indexOf, y = identity, ...options} = {}) {
  return new Line(data, maybeDenseIntervalX({...options, x, y}));
}
