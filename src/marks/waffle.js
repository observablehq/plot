import {extent, namespaces} from "d3";
import {create} from "../context.js";
import {composeRender} from "../mark.js";
import {hasXY, identity, indexOf} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, getPatternId} from "../style.js";
import {template} from "../template.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";
import {BarX, BarY} from "./bar.js";

const waffleDefaults = {
  ariaLabel: "waffle"
};

export class WaffleX extends BarX {
  constructor(data, {unit = 1, gap = 1, round, render, ...options} = {}) {
    super(data, {...options, render: composeRender(render, waffleRender("x"))}, waffleDefaults);
    this.unit = Math.max(0, unit);
    this.gap = +gap;
    this.round = maybeRound(round);
  }
}

export class WaffleY extends BarY {
  constructor(data, {unit = 1, gap = 1, round, render, ...options} = {}) {
    super(data, {...options, render: composeRender(render, waffleRender("y"))}, waffleDefaults);
    this.unit = Math.max(0, unit);
    this.gap = +gap;
    this.round = maybeRound(round);
  }
}

function waffleRender(y) {
  return function (index, scales, values, dimensions, context) {
    const {unit, gap, rx, ry, round} = this;
    const {document} = context;
    const Y1 = values.channels[`${y}1`].value;
    const Y2 = values.channels[`${y}2`].value;

    // We might not use all the available bandwidth if the cells don’t fit evenly.
    const barwidth = this[y === "y" ? "_width" : "_height"](scales, values, dimensions);
    const barx = this[y === "y" ? "_x" : "_y"](scales, values, dimensions);

    // The length of a unit along y in pixels.
    const scale = unit * scaleof(scales.scales[y]);

    // The number of cells on each row of the waffle.
    const columns = Math.max(1, Math.floor(Math.sqrt(barwidth / scale)));

    // The outer size of each square cell, in pixels, including the gap.
    const cellsize = scale * columns;

    // TODO insets?
    const transform = y === "y" ? ([x, y]) => [x * cellsize, -y * cellsize] : ([x, y]) => [y * cellsize, x * cellsize];
    const tx = (barwidth - columns * cellsize) / 2;
    const x0 = typeof barx === "function" ? (i) => barx(i) + tx : barx + tx;
    const y0 = scales[y](0);

    // Create a base pattern with shared attributes for cloning.
    const patternId = getPatternId();
    const basePattern = document.createElementNS(namespaces.svg, "pattern");
    basePattern.setAttribute("width", cellsize);
    basePattern.setAttribute("height", cellsize);
    basePattern.setAttribute("patternUnits", "userSpaceOnUse");
    const basePatternRect = basePattern.appendChild(document.createElementNS(namespaces.svg, "rect"));
    basePatternRect.setAttribute("x", gap / 2);
    basePatternRect.setAttribute("y", gap / 2);
    basePatternRect.setAttribute("width", cellsize - gap);
    basePatternRect.setAttribute("height", cellsize - gap);
    if (rx != null) basePatternRect.setAttribute("rx", rx);
    if (ry != null) basePatternRect.setAttribute("ry", ry);

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(this._transform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append(() => basePattern.cloneNode(true))
          .attr("id", (i) => `${patternId}-${i}`)
          .select("rect")
          .call(applyDirectStyles, this)
          .call(applyChannelStyles, this, values)
      )
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .attr("transform", y === "y" ? template`translate(${x0},${y0})` : template`translate(${y0},${x0})`)
          .attr(
            "d",
            (i) =>
              `M${wafflePoints(round(Y1[i] / unit), round(Y2[i] / unit), columns)
                .map(transform)
                .join("L")}Z`
          )
          .attr("fill", (i) => `url(#${patternId}-${i})`)
      )
      .node();
  };
}

// A waffle is a approximately rectangular shape, but may have one or two corner
// cuts if the starting or ending value is not an even multiple of the number of
// columns (the width of the waffle in cells). We can represent any waffle by
// 8 points; below is a waffle of five columns representing the interval 2–11:
//
// 1-0
// |•7-------6
// |• • • • •|
// 2---3• • •|
//     4-----5
//
// Note that points 0 and 1 always have the same y-value, points 1 and 2 have
// the same x-value, and so on, so we don’t need to materialize the x- and y-
// values of all points. Also note that we can’t use the already-projected y-
// values because these assume that y-values are distributed linearly along y
// rather than wrapping around in columns.
//
// The corner points may be coincident. If the ending value is an even multiple
// of the number of columns, say representing the interval 2–10, then points 6,
// 7, and 0 are the same.
//
// 1-----0/7/6
// |• • • • •|
// 2---3• • •|
//     4-----5
//
// Likewise if the starting value is an even multiple, say representing the
// interval 0–10, points 2–4 are coincident.
//
// 1-----0/7/6
// |• • • • •|
// |• • • • •|
// 4/3/2-----5
//
// Waffles can also represent fractional intervals (e.g., 2.4–10.1). These
// require additional corner cuts, so the implementation below generates a few
// more points.
function wafflePoints(i1, i2, columns) {
  return [
    [floor(abs(i2) % columns), ceil(i2 / columns)],
    [0, ceil(i2 / columns)],
    [0, ceil(i1 / columns)],
    [floor(abs(i1) % columns), ceil(i1 / columns)],
    [floor(abs(i1) % columns), floor(i1 / columns) + (i1 % 1)],
    [ceil(abs(i1) % columns), floor(i1 / columns) + (i1 % 1)],
    [ceil(abs(i1) % columns), floor(i1 / columns)],
    [columns, floor(i1 / columns)],
    [columns, floor(i2 / columns)],
    [ceil(abs(i2) % columns), floor(i2 / columns)],
    [ceil(abs(i2) % columns), floor(i2 / columns) + (i2 % 1)],
    [floor(abs(i2) % columns), floor(i2 / columns) + (i2 % 1)]
  ];
}

function maybeRound(round) {
  if (round === undefined || round === false) return Number;
  if (round === true) return Math.round;
  if (typeof round !== "function") throw new Error(`invalid round: ${round}`);
  return round;
}

function scaleof({domain, range}) {
  return spread(range) / spread(domain);
}

function spread(domain) {
  const [min, max] = extent(domain);
  return max - min;
}

function abs(x) {
  return Math.abs(x);
}

function ceil(x) {
  return (x < 0 ? Math.floor : Math.ceil)(x);
}

function floor(x) {
  return (x < 0 ? Math.ceil : Math.floor)(x);
}

export function waffleX(data, options = {}) {
  if (!hasXY(options)) options = {...options, y: indexOf, x2: identity};
  return new WaffleX(data, maybeStackX(maybeIntervalX(maybeIdentityX(options))));
}

export function waffleY(data, options = {}) {
  if (!hasXY(options)) options = {...options, x: indexOf, y2: identity};
  return new WaffleY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
