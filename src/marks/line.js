import {group, line as shapeLine} from "d3";
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
import {applyHalo, maybeHalo} from "./halo.js";

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
    const {x, y, z, curve, tension, halo, haloColor, haloRadius} = options;
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
    this.halo = maybeHalo(halo, haloColor, haloRadius);
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
    const {x: X, y: Y, z: Z} = channels;
    const {curve} = this;
    const g = create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales);

    // When adding a halo to multiple series, nest by series so each
    // gets its own halo filter; otherwise render paths directly into g.
    const filter = applyHalo(g, this);
    const segments = groupIndex(index, [X, Y], this, channels);
    (this.halo && Z
      ? g
          .selectAll()
          .data(group(segments, (I) => Z[I.find((i) => i >= 0)]))
          .enter()
          .append("g")
      : g.datum([, segments])
    )
      .attr("filter", filter)
      .selectAll()
      .data(([, d]) => d)
      .enter()
      .append("path")
      .call(applyDirectStyles, this)
      .call(applyGroupedChannelStyles, this, channels)
      .call(applyGroupedMarkers, this, channels, context)
      .attr(
        "d",
        curve === curveAuto && context.projection
          ? sphereLine(context.path(), X, Y)
          : shapeLine()
              .curve(curve)
              .defined((i) => i >= 0)
              .x((i) => X[i])
              .y((i) => Y[i])
      );

    return g.node();
  }
}

function sphereLine(path, X, Y) {
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
