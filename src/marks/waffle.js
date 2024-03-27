import {template} from "../template.js";
import {create} from "../context.js";
import {Mark} from "../mark.js";
import {hasXY, identity, indexOf} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, getClipId} from "../style.js";
import {maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalY} from "../transforms/interval.js";
import {maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "waffle"
};

let nextWaffleId = 0;

export class WaffleY extends Mark {
  constructor(data, options = {}) {
    const {x, y1, y2} = options;
    super(
      data,
      {
        y1: {value: y1, scale: "y", type: "linear"},
        y2: {value: y2, scale: "y", type: "linear"},
        x: {value: x, scale: "x", type: "band", optional: true}
      },
      options,
      defaults
    );
  }
  render(index, scales, channels, dimensions, context) {
    // TODO rx, ry affects each waffle cell
    // TODO recycle patterns that share the same fill color
    const patternId = `plot-waffle-${++nextWaffleId}`;

    // The length of a unit along y in pixels.
    // TODO multiples (e.g., each cell in the waffle represents one thousand)
    const scale = Math.abs(scales.y(0) - scales.y(1));

    // The width of the waffle, in cells. This must be an integer. TODO We need
    // to compute this automatically, but how?
    const columns = 10;

    // The outer size of each square waffle cell, in pixels, including the gap.
    const cellsize = scale * columns;

    // The gap between adjacent cells, in pixels.
    const cellgap = 1;

    // The available bandwidth; we might not use all the available space if the
    // waffle cells don’t fit evenly.
    const bandwidth = this._width(scales, channels, dimensions);

    // A waffle is generally a rectangular shape, but may have one or two corner
    // cuts if the number of units in the starting or ending value of the waffle
    // is not an even multiple of the number of columns (the width of the waffle
    // in cells). We can represent any waffle by seven points. Below is a waffle
    // of five columns representing the interval 2–11:
    //
    //         0-1
    // 6-------7█|
    // |█ █ █ █ █|
    // |█ █ █3---2
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
    // |█ █ █ █ █|
    // |█ █ █3---2
    // 5-----4
    //
    // Likewise if the starting value is an even multiple, say representing the
    // interval 0–10, points 2–4 are coincident.
    //
    // 6/7/0-----1
    // |█ █ █ █ █|
    // |█ █ █ █ █|
    // 5-----2/3/4
    //
    // Waffles can also represent fractional intervals (e.g., 2.4–10.1), but we
    // haven’t implemented that yet.

    const {marginLeft, marginBottom, height} = dimensions;
    const F = channels.fill;
    const Y1 = channels.channels.y1.value;
    const Y2 = channels.channels.y2.value;
    const {y} = scales;

    const x0 = (i) => marginLeft + (columns - (Y2[i] % columns)) * cellsize;
    const y0 = (i) => y(Math.ceil(Y2[i] / columns) * columns);
    const x1 = () => marginLeft + columns * cellsize;
    const y2 = (i) => y(Math.ceil(Y1[i] / columns) * columns);
    const x3 = (i) => marginLeft + (columns - (Y1[i] % columns)) * cellsize;
    const y4 = (i) => y(Math.floor(Y1[i] / columns) * columns);
    const x5 = () => marginLeft + 0;
    const y6 = (i) => y(Math.floor(Y2[i] / columns) * columns);
    const x7 = (i) => marginLeft + (columns - (Y2[i] % columns)) * cellsize;

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(this._transform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .call((g) =>
            g
              .append("pattern")
              .attr("id", (i) => `${patternId}-${i}`)
              .attr("width", cellsize)
              .attr("height", cellsize)
              .attr("x", marginLeft)
              .attr("y", height - marginBottom - cellsize)
              .attr("patternUnits", "userSpaceOnUse")
              .append("rect")
              .attr("fill", (i) => F[i])
              .attr("x", cellgap / 2)
              .attr("y", cellgap / 2)
              .attr("width", cellsize - cellgap)
              .attr("height", cellsize - cellgap)
          )
          .call((g) =>
            g
              .append("path")
              .call(applyDirectStyles, this)
              .attr("d", template`M${x0},${y0}H${x1}V${y2}H${x3}V${y4}H${x5}V${y6}H${x7}Z`)
              .call(applyChannelStyles, this, channels) // TODO remove fill
              .attr("fill", (i) => `url(#${patternId}-${i})`)
          )
      )
      .node();
  }
  _transform(selection, mark, {y}) {
    selection.call(applyTransform, mark, {y}, 0, 0);
  }
  _width({x}, {x: X}, {marginRight, marginLeft, width}) {
    const bandwidth = X && x ? x.bandwidth() : width - marginRight - marginLeft;
    return Math.max(0, bandwidth);
  }
}

export function waffleY(data, options = {}) {
  if (!hasXY(options)) options = {...options, x: indexOf, y2: identity};
  return new WaffleY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
