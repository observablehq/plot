import {geoPath, line as shapeLine} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {indexOf, identity, maybeTuple, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {coerceNumbers} from "../scales.js";
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

const curveProjection = Symbol("projection");

// For the “projection” curve, return a symbol instead of a curve
// implementation; we’ll use d3.geoPath instead of d3.line to render.
function LineCurve({curve, tension}) {
  return typeof curve !== "function" && `${curve}`.toLowerCase() === "projection"
    ? curveProjection
    : Curve(curve, tension);
}

export class Line extends Mark {
  constructor(data, options = {}) {
    const {x, y, z} = options;
    const curve = LineCurve(options);
    super(
      data,
      {
        x: {value: x, scale: curve === curveProjection ? undefined : "x"}, // unscaled if projected
        y: {value: y, scale: curve === curveProjection ? undefined : "y"}, // unscaled if projected
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    this.curve = curve;
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    const {curve} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions, context)
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
            curve === curveProjection
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

/** @jsdoc line */
export function line(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Line(data, {...remainingOptions, x, y});
}

/** @jsdoc lineX */
export function lineX(data, options = {}) {
  const {x = identity, y = indexOf, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalY({...remainingOptions, x, y}));
}

/** @jsdoc lineY */
export function lineY(data, options = {}) {
  const {x = indexOf, y = identity, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalX({...remainingOptions, x, y}));
}
