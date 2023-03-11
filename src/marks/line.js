import {geoPath, line as shapeLine} from "d3";
import {create} from "../context.js";
import {curveAuto, maybeCurveAuto} from "../curve.js";
import {Mark} from "../mark.js";
import {applyGroupedMarkers, markers} from "../marker.js";
import {coerceNumbers, indexOf, identity, maybeTuple, maybeZ} from "../options.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyGroupedChannelStyles,
  groupIndex
} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";

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
    this.curve = maybeCurveAuto(curve, tension);
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  project(channels, values, context) {
    // For the auto curve, projection is handled at render.
    if (this.curve !== curveAuto) {
      super.project(channels, values, context);
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    const {curve} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X, Y], this, channels))
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .call(applyGroupedMarkers, this, channels, context)
          .attr(
            "d",
            curve === curveAuto && context.projection
              ? sphereLine(context.projection, X, Y)
              : shapeLine()
                  .curve(curve)
                  .defined((i) => i >= 0)
                  .x((i) => X[i])
                  .y((i) => Y[i])
          )
      )
      .node();
  }
}

function sphereLine(projection, X, Y) {
  const path = geoPath(projection);
  X = coerceNumbers(X);
  Y = coerceNumbers(Y);
  return (I) => {
    let line = [];
    const lines = [line];
    for (const i of I) {
      // Check for undefined value; see groupIndex.
      if (i === -1) {
        line = [];
        lines.push(line);
      } else {
        line.push([X[i], Y[i]]);
      }
    }
    return path({type: "MultiLineString", coordinates: lines});
  };
}

export function line(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Line(data, {...remainingOptions, x, y});
}

export function lineX(data, options = {}) {
  const {x = identity, y = indexOf, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalY({...remainingOptions, x, y}));
}

export function lineY(data, options = {}) {
  const {x = indexOf, y = identity, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalX({...remainingOptions, x, y}));
}
