import {group} from "d3";
import {create} from "d3";
import {area as shapeArea} from "d3";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, maybeColor, titleGroup, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr} from "../style.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

export class Area extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z, // optional grouping for multiple series
      title,
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      curve,
      tension,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "none");
    const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
    const [vfill, cfill] = maybeColor(fill, cstroke === "none" ? "currentColor" : "none");
    const [vfillOpacity, cfillOpacity] = maybeNumber(fillOpacity);
    if (z === undefined && vfill != null) z = vfill;
    if (z === undefined && vstroke != null) z = vstroke;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
      ],
      options
    );
    this.curve = Curve(curve, tension);
    Style(this, {
      fill: cfill,
      fillOpacity: cfillOpacity,
      stroke: cstroke,
      strokeMiterlimit: cstroke === "none" ? undefined : 1,
      strokeOpacity: cstrokeOpacity,
      ...options
    });
  }
  render(I, {x, y}, {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1, z: Z, title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .call(applyAttr, "fill", F && (([i]) => F[i]))
            .call(applyAttr, "fill-opacity", FO && (([i]) => FO[i]))
            .call(applyAttr, "stroke", S && (([i]) => S[i]))
            .call(applyAttr, "stroke-opacity", SO && (([i]) => SO[i]))
            .attr("d", shapeArea()
              .curve(this.curve)
              .defined(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]))
              .x0(i => X1[i])
              .y0(i => Y1[i])
              .x1(i => X2[i])
              .y1(i => Y2[i]))
            .call(titleGroup(L)))
      .node();
  }
}

export function area(data, options) {
  return new Area(data, options);
}

export function areaX(data, {y = indexOf, ...options} = {}) {
  return new Area(data, maybeStackX({...options, y1: y, y2: undefined}));
}

export function areaY(data, {x = indexOf, ...options} = {}) {
  return new Area(data, maybeStackY({...options, x1: x, x2: undefined}));
}
