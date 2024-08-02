import {extent, namespaces} from "d3";
import {composeRender} from "../mark.js";
import {hasXY, identity, indexOf} from "../options.js";
import {getPatternId} from "../style.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";
import {BarX, BarY} from "./bar.js";

export class WaffleX extends BarX {
  constructor(data, {unit = 1, gap = 1, round, render, ...options} = {}) {
    super(data, {...options, render: composeRender(render, waffleRender("x"))});
    this.unit = Math.max(0, unit);
    this.gap = +gap;
    this.round = maybeRound(round);
  }
}

export class WaffleY extends BarY {
  constructor(data, {unit = 1, gap = 1, round, render, ...options} = {}) {
    super(data, {...options, render: composeRender(render, waffleRender("y"))});
    this.unit = Math.max(0, unit);
    this.gap = +gap;
    this.round = maybeRound(round);
  }
}

function waffleRender(y) {
  const x = y === "y" ? "x" : "y";
  return function (index, scales, values, dimensions, context, next) {
    const {unit, gap, rx, ry, round} = this;
    const {document} = context;
    const g = next(index, scales, values, dimensions, context);

    // We might not use all the available bandwidth if the cells don’t fit evenly.
    const bandwidth = this[y === "y" ? "_width" : "_height"](scales, values, dimensions);

    // The length of a unit along y in pixels.
    const scale = unit * scaleof(scales.scales[y]);

    // The number of cells on each row of the waffle.
    const columns = Math.max(1, Math.floor(Math.sqrt(bandwidth / scale)));

    // The outer size of each square cell, in pixels, including the gap.
    const cellsize = scale * columns;

    // TODO insets?
    const Y1 = values.channels[`${y}1`].value;
    const Y2 = values.channels[`${y}2`].value;
    const ww = columns * cellsize;
    const wx = (bandwidth - ww) / 2;
    let rect = g.firstElementChild;
    const y0 = scales[y](0);
    const basePattern = document.createElementNS(namespaces.svg, "pattern");
    basePattern.setAttribute("width", cellsize);
    basePattern.setAttribute("height", cellsize);
    basePattern.setAttribute("patternUnits", "userSpaceOnUse");
    basePattern.setAttribute(y, y0);
    const basePatternRect = basePattern.appendChild(document.createElementNS(namespaces.svg, "rect"));
    basePatternRect.setAttribute("x", gap / 2);
    basePatternRect.setAttribute("y", gap / 2);
    basePatternRect.setAttribute("width", cellsize - gap);
    basePatternRect.setAttribute("height", cellsize - gap);
    if (rx != null) basePatternRect.setAttribute("rx", rx);
    if (ry != null) basePatternRect.setAttribute("ry", ry);
    for (const i of index) {
      const x0 = +rect.getAttribute(x) + wx;
      const fill = rect.getAttribute("fill"); // TODO handle constant fill
      const stroke = rect.getAttribute("stroke"); // TODO handle constant fill
      const patternId = getPatternId(); // TODO reused shared patterns
      const pattern = g.insertBefore(basePattern.cloneNode(true), rect);
      const patternRect = pattern.firstChild;
      pattern.setAttribute("id", patternId);
      pattern.setAttribute(x, x0);
      if (fill != null) patternRect.setAttribute("fill", fill);
      if (stroke != null) patternRect.setAttribute("stroke", stroke);
      const path = document.createElementNS(namespaces.svg, "path");
      for (const a of rect.attributes) {
        switch (a.name) {
          case "x":
          case "y":
          case "width":
          case "height":
          case "fill":
          case "stroke":
            continue;
        }
        path.setAttribute(a.name, a.value);
      }
      path.setAttribute(
        "d",
        `M${wafflePoints(round(Y1[i] / unit), round(Y2[i] / unit), columns)
          .map(
            y === "y"
              ? ([x, y]) => [x * cellsize + x0, y0 - y * cellsize]
              : ([x, y]) => [y * cellsize + y0, x0 + x * cellsize]
          )
          .join("L")}Z`
      );
      if (stroke != null) path.setAttribute("stroke", `url(#${patternId})`); // TODO if necessary
      path.setAttribute("fill", `url(#${patternId})`);
      const nextRect = rect.nextElementSibling;
      rect.replaceWith(path);
      rect = nextRect;
    }

    return g;
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
