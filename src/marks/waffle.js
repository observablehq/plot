import {namespaces} from "d3";
import {hasXY, identity, indexOf} from "../options.js";
import {maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalY} from "../transforms/interval.js";
import {maybeStackY} from "../transforms/stack.js";
import {BarY} from "./bar.js";

let nextWaffleId = 0;

export class WaffleY extends BarY {
  constructor(data, options) {
    super(data, options);
  }
  render(index, scales, channels, dimensions, context) {
    const g = super.render(index, scales, channels, dimensions, context);

    // The available bandwidth; we might not use all the available space if the
    // waffle cells don’t fit evenly.
    const bandwidth = this._width(scales, channels, dimensions);

    // The length of a unit along y in pixels.
    // TODO multiples (e.g., each cell in the waffle represents one thousand)
    const scale = Math.abs(scales.y(0) - scales.y(1));

    // The width of the waffle, in cells. This must be an integer. TODO We need
    // to compute this automatically, but how?
    const columns = Math.floor(Math.sqrt(bandwidth / scale));

    // The outer size of each square waffle cell, in pixels, including the gap.
    const cellsize = scale * columns;

    // The gap between adjacent cells, in pixels.
    const cellgap = 1;

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
    // Waffles can also represent fractional intervals (e.g., 2.4–10.1), but we
    // haven’t implemented that yet.

    // TODO rx, ry
    for (const rect of g.querySelectorAll("rect")) {
      const x = +rect.getAttribute("x");
      const fill = rect.getAttribute("fill");
      const patternId = `plot-waffle-${++nextWaffleId}`;
      const pattern = context.document.createElementNS(namespaces.svg, "pattern");
      pattern.setAttribute("id", patternId)
      pattern.setAttribute("width", cellsize);
      pattern.setAttribute("height", cellsize);
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      pattern.setAttribute("x", x);
      pattern.setAttribute("y", scales.y(0) - cellgap);
      const patternRect = context.document.createElementNS(namespaces.svg, "rect");
      patternRect.setAttribute("fill", fill);
      patternRect.setAttribute("x", cellgap / 2);
      patternRect.setAttribute("y", cellgap / 2);
      patternRect.setAttribute("width", cellsize - cellgap);
      patternRect.setAttribute("height", cellsize - cellgap);
      pattern.appendChild(patternRect);
      rect.setAttribute("transform", `translate(${(bandwidth - columns * cellsize) / 2},0)`);
      rect.setAttribute("width", columns * cellsize);
      rect.setAttribute("fill", `url(#${patternId})`);
      g.insertBefore(pattern, rect);
    }

    return g;
  }
}

export function waffleY(data, options = {}) {
  if (!hasXY(options)) options = {...options, x: indexOf, y2: identity};
  return new WaffleY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
