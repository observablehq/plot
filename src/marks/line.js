import {geoPath, line as shapeLine} from "d3";
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

/** @jsdoc line */
export function line(data, options = {}) {
  let {x, y, curve, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return curve === "geodesic"
    ? new LineGeodesic(data, {...remainingOptions, x, y})
    : new Line(data, {...remainingOptions, curve, x, y});
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

export class LineGeodesic extends Mark {
  constructor(data, options = {}) {
    const {x, y, z} = options;
    super(
      data,
      {
        x: {value: x},
        y: {value: y},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    const {projection} = context;
    if (projection === undefined) throw new Error("A projection is needed for geodesic curves");
    const path = geoPath(projection);
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
          .attr("d", (I) =>
            path({
              type: "LineString",
              coordinates: Array.from(I, (i) => [+X[i], +Y[i]]).filter(([x, y]) => !isNaN(x + y))
            })
          )
      )
      .node();
  }
}
