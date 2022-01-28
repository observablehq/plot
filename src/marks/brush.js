import {brush as brusher, brushX as brusherX, brushY as brusherY, create, select} from "d3";
import {identity, maybeTuple} from "../options.js";
import {Mark, selectionEquals} from "../plot.js";
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
    this.currentElement = null;
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;
    const {ariaLabel, ariaDescription, ariaHidden, ...options} = this;
    const left = marginLeft;
    const top = marginTop;
    const right = width - marginRight;
    const bottom = height - marginBottom;
    const mark = this;
    const g = create("svg:g")
        .call(applyIndirectStyles, {ariaLabel, ariaDescription, ariaHidden})
        .call((X && Y ? brusher : X ? brusherX : brusherY)()
          .extent([[left, top], [right, bottom]])
          .on("start brush end", function(event) {
            const {type, selection} = event;
            // For faceting, when starting a brush in a new facet, clear the
            // brush and selection on the old facet. In the future, we might
            // allow independent brushes across facets by disabling this?
            if (type === "start" && mark.currentElement !== this) {
              if (mark.currentElement !== null) {
                select(mark.currentElement).call(event.target.clear, event);
                mark.currentElement.selection = null;
              }
              mark.currentElement = this;
            }
            let S = null;
            if (selection) {
              S = index;
              if (X) {
                let [x0, x1] = Y ? [selection[0][0], selection[1][0]] : selection;
                if (x.bandwidth) x0 -= x.bandwidth();
                S = S.filter(i => x0 <= X[i] && X[i] <= x1);
              }
              if (Y) {
                let [y0, y1] = X ? [selection[0][1], selection[1][1]] : selection;
                if (y.bandwidth) y0 -= y.bandwidth();
                S = S.filter(i => y0 <= Y[i] && Y[i] <= y1);
              }
            }
            if (!selectionEquals(this.selection, S)) {
              this.selection = S;
              this.dispatchEvent(new Event("input", {bubbles: true}));
            }
          }))
        .call(g => g.selectAll(".selection")
          .attr("shape-rendering", null) // reset d3-brush
          .call(applyIndirectStyles, options)
          .call(applyDirectStyles, options))
      .node();
    g.selection = null;
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
