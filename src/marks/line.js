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

    // When the line mark is used with a "sphere" curve and a projection
    // (supposedly spherical), keep x and y as numbers.
    const sphere = curve === "sphere";
    super(
      data,
      {
        x: {value: x, scale: sphere ? undefined : "x"},
        y: {value: y, scale: sphere ? undefined : "y"},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    if (sphere) this.sphere = true;
    else this.curve = Curve(curve, tension);
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;

    let shape;
    if (this.sphere) {
      const {projection} = context;
      if (projection === undefined) throw new Error("the sphere curve requires a projection");
      const path = geoPath(projection);
      shape = (I) =>
        path({
          type: "LineString",
          coordinates: Array.from(I, (i) => [+X[i], +Y[i]]).filter(([x, y]) => !isNaN(x + y))
        });
    } else {
      shape = shapeLine()
        .curve(this.curve)
        .defined((i) => i >= 0)
        .x((i) => X[i])
        .y((i) => Y[i]);
    }

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
          .attr("d", shape)
      )
      .node();
  }
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
