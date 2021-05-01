import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, number, maybeColor, title, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString, applyAttr} from "../style.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

export class Rect extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      title,
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset,
      rx,
      ry,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "none");
    const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
    const [vfill, cfill] = maybeColor(fill, cstroke === "none" ? "currentColor" : "none");
    const [vfillOpacity, cfillOpacity] = maybeNumber(fillOpacity);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y2", value: y2, scale: "y"},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
      ],
      options
    );
    Style(this, {
      fill: cfill,
      fillOpacity: cfillOpacity,
      stroke: cstroke,
      strokeOpacity: cstrokeOpacity,
      ...options
    });
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto"); // number or percentage
    this.ry = impliedString(ry, "auto");
  }
  render(
    I,
    {x, y},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO}
  ) {
    const {rx, ry} = this;
    const index = filter(I, X1, Y2, X2, Y2, F, FO, S, SO);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", i => Math.min(X1[i], X2[i]) + this.insetLeft)
            .attr("y", i => Math.min(Y1[i], Y2[i]) + this.insetTop)
            .attr("width", i => Math.max(0, Math.abs(X2[i] - X1[i]) - this.insetLeft - this.insetRight))
            .attr("height", i => Math.max(0, Math.abs(Y1[i] - Y2[i]) - this.insetTop - this.insetBottom))
            .call(applyAttr, "fill", F && (i => F[i]))
            .call(applyAttr, "fill-opacity", FO && (i => FO[i]))
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(applyAttr, "stroke-opacity", SO && (i => SO[i]))
            .call(applyAttr, "rx", rx)
            .call(applyAttr, "ry", ry)
            .call(title(L)))
      .node();
  }
}

export function rect(data, options) {
  return new Rect(data, options);
}

export function rectX(data, options) {
  return new Rect(data, maybeStackX(options));
}

export function rectY(data, options) {
  return new Rect(data, maybeStackY(options));
}
