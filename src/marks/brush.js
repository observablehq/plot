import {brush as brusher, brushX as brusherX, brushY as brusherY, create, select} from "d3";
import {identity, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection, selectionEquals} from "../selection.js";
import {applyDirectStyles, applyIndirectStyles} from "../style.js";

const defaults = {
  ariaLabel: "brush",
  fill: "#777",
  fillOpacity: 0.3,
  stroke: "#fff"
};

export class Brush extends Mark {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.activeElement = null;
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {ariaLabel, ariaDescription, ariaHidden, ...options} = this;
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;
    const brush = this;
    const g = create("svg:g")
        .call(applyIndirectStyles, {ariaLabel, ariaDescription, ariaHidden})
        .call((X && Y ? brusher : X ? brusherX : brusherY)()
          .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
          .on("start brush end", function(event) {
            const {type, selection: extent} = event;
            // For faceting, when starting a brush in a new facet, clear the
            // brush and selection on the old facet. In the future, we might
            // allow independent brushes across facets by disabling this?
            if (type === "start" && brush.activeElement !== this) {
              if (brush.activeElement !== null) {
                select(brush.activeElement).call(event.target.clear, event);
                brush.activeElement[selection] = null;
              }
              brush.activeElement = this;
            }
            let S = null;
            if (extent) {
              S = index;
              if (X) {
                let [x0, x1] = Y ? [extent[0][0], extent[1][0]] : extent;
                if (x.bandwidth) x0 -= x.bandwidth();
                S = S.filter(i => x0 <= X[i] && X[i] <= x1);
              }
              if (Y) {
                let [y0, y1] = X ? [extent[0][1], extent[1][1]] : extent;
                if (y.bandwidth) y0 -= y.bandwidth();
                S = S.filter(i => y0 <= Y[i] && Y[i] <= y1);
              }
            }
            if (!selectionEquals(this[selection], S)) {
              this[selection] = S;
              this.dispatchEvent(new Event("input", {bubbles: true}));
            }
          }))
        .call(g => g.selectAll(".selection")
          .attr("shape-rendering", null) // reset d3-brush
          .call(applyIndirectStyles, options)
          .call(applyDirectStyles, options))
      .node();
    g[selection] = null;
    return g;
  }
}

export function brush(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Brush(data, {...options, x, y});
}

export function brushX(data, {x = identity, ...options} = {}) {
  return new Brush(data, {...options, x, y: null});
}

export function brushY(data, {y = identity, ...options} = {}) {
  return new Brush(data, {...options, x: null, y});
}
