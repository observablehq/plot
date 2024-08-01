import {namespaces} from "d3";
import {hasXY, identity, indexOf} from "../options.js";
import {maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalY} from "../transforms/interval.js";
import {maybeStackY} from "../transforms/stack.js";
import {BarY} from "./bar.js";

let nextWaffleId = 0;

export class WaffleY extends BarY {
  constructor(data, options) {
    super(data, {...options, stroke: "none"});
  }
  render(index, scales, channels, dimensions, context) {
    const {document} = context;
    const g = super.render(index, scales, channels, dimensions, context);

    // The available bandwidth; we might not use all the available space if the
    // waffle cells don’t fit evenly.
    const bandwidth = this._width(scales, channels, dimensions);

    // The length of a unit along y in pixels.
    // TODO multiples (e.g., each cell in the waffle represents one thousand)
    const scale = Math.abs(scales.y(0) - scales.y(1));

    // The width of the waffle, in cells. This must be an integer.
    const columns = Math.floor(Math.sqrt(bandwidth / scale));

    // The outer size of each square waffle cell, in pixels, including the gap.
    const cellsize = scale * columns;

    // The gap between adjacent cells, in pixels.
    const cellgap = 1;

    // TODO rx, ry
    // TODO insets?
    const Y1 = channels.channels.y1.value;
    const Y2 = channels.channels.y2.value;
    const ww = columns * cellsize;
    const wx = (bandwidth - ww) / 2;
    let rect = g.firstElementChild;
    const y0 = scales.y(0) - cellgap;
    const basePattern = document.createElementNS(namespaces.svg, "pattern");
    basePattern.setAttribute("width", cellsize);
    basePattern.setAttribute("height", cellsize);
    basePattern.setAttribute("patternUnits", "userSpaceOnUse");
    basePattern.setAttribute("y", y0);
    const basePatternRect = basePattern.appendChild(document.createElementNS(namespaces.svg, "rect"));
    basePatternRect.setAttribute("x", cellgap / 2);
    basePatternRect.setAttribute("y", cellgap / 2);
    basePatternRect.setAttribute("width", cellsize - cellgap);
    basePatternRect.setAttribute("height", cellsize - cellgap);
    for (const i of index) {
      const x0 = +rect.getAttribute("x") + wx;
      const fill = rect.getAttribute("fill");
      const patternId = `plot-waffle-${++nextWaffleId}`;
      const pattern = g.insertBefore(basePattern.cloneNode(true), rect);
      const patternRect = pattern.firstChild;
      pattern.setAttribute("id", patternId);
      pattern.setAttribute("x", x0);
      patternRect.setAttribute("fill", fill);
      const path = document.createElementNS(namespaces.svg, "path");
      for (const a of rect.attributes) {
        switch (a.name) {
          case "x":
          case "y":
          case "width":
          case "height":
          case "fill":
            continue;
        }
        path.setAttribute(a.name, a.value);
      }
      path.setAttribute(
        "d",
        `M${wafflePoints(Y1[i], Y2[i], columns)
          .map(([x, y]) => [x * cellsize + x0, y0 - y * cellsize])
          .join("L")}Z`
      );
      path.setAttribute("fill", `url(#${patternId})`);
      const nextRect = rect.nextElementSibling;
      rect.replaceWith(path);
      rect = nextRect;
    }

    return g;
  }
}

// A waffle is generally a rectangular shape, but may have one or two corner
// cuts if the number of units in the starting or ending value of the waffle
// is not an even multiple of the number of columns (the width of the waffle
// in cells). We can represent any waffle by seven points. Below is a waffle
// of five columns representing the interval 2–11:
//
//         0-1
// 6-------7•|
// |• • • • •|
// |• • •3---2
// 5-----4
//
// Note that points 0 and 1 always have the same y-value, points 1 and 2
// have the same x-value, and so on, so we don’t need to materialize the x-
// and y-values of all points. Also note that we can’t use the already-
// projected y-values because these assume that y-values are distributed
// linearly along y rather than wrapping around in columns.
//
// The corner points may be coincident. If the ending value is an even
// multiple of the number of columns, say representing the interval 2–10,
// then points 6, 7, and 0 are the same.
//
// 6/7/0-----1
// |• • • • •|
// |• • •3---2
// 5-----4
//
// Likewise if the starting value is an even multiple, say representing the
// interval 0–10, points 2–4 are coincident.
//
// 6/7/0-----1
// |• • • • •|
// |• • • • •|
// 5-----2/3/4
//
// Waffles can also represent fractional intervals (e.g., 2.4–10.1).
function wafflePoints(i1, i2, columns) {
  return [
    [Math.ceil(columns - (i2 % columns)), Math.ceil(i2 / columns)],
    [columns, Math.ceil(i2 / columns)],
    [columns, Math.ceil(i1 / columns)],
    [Math.ceil(columns - (i1 % columns)), Math.ceil(i1 / columns)],
    [Math.ceil(columns - (i1 % columns)), Math.floor(i1 / columns) + (i1 % 1)],
    [Math.floor(columns - (i1 % columns)), Math.floor(i1 / columns) + (i1 % 1)],
    [Math.floor(columns - (i1 % columns)), Math.floor(i1 / columns)],
    [0, Math.floor(i1 / columns)],
    [0, Math.floor(i2 / columns)],
    [Math.floor(columns - (i2 % columns)), Math.floor(i2 / columns)],
    [Math.floor(columns - (i2 % columns)), Math.floor(i2 / columns) + (i2 % 1)],
    [Math.ceil(columns - (i2 % columns)), Math.floor(i2 / columns) + (i2 % 1)]
  ];
}

export function waffleY(data, options = {}) {
  if (!hasXY(options)) options = {...options, x: indexOf, y2: identity};
  return new WaffleY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
