import {group, sort} from "d3-array";
import {create} from "d3-selection";
import {area as shapeArea} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, maybeColor, maybeZero, first, second, titleGroup} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

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
      stroke,
      curve,
      tension,
      ...options
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill, "currentColor");
    const [vstroke, cstroke] = maybeColor(stroke, "none");
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
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    this.curve = Curve(curve, tension);
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeMiterlimit: cstroke === "none" ? undefined : 1,
      ...options
    });
  }
  render(I, {x, y, color}, {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1, z: Z, title: L, fill: F, stroke: S}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(Z ? sort(group(I, i => Z[i]), first).map(second) : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .attr("fill", F && (([i]) => color(F[i])))
            .attr("stroke", S && (([i]) => color(S[i])))
            .attr("d", shapeArea()
              .curve(this.curve)
              .defined(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]))
              .x0(i => x(X1[i]))
              .y0(i => y(Y1[i]))
              .x1(i => x(X2[i]))
              .y1(i => y(Y2[i])))
            .call(titleGroup(L)))
      .node();
  }
}

export function area(data, options) {
  return new Area(data, options);
}

export function areaX(data, {x, x1, x2, y = indexOf, ...options} = {}) {
  ([x1, x2] = maybeZero(x, x1, x2));
  return new Area(data, {...options, x1, x2, y1: y, y2: undefined});
}

export function areaY(data, {x = indexOf, y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeZero(y, y1, y2));
  return new Area(data, {...options, x1: x, x2: undefined, y1, y2});
}
