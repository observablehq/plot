import {create} from "d3-selection";
import {line as shapeLine} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {group} from "../group.js";
import {Mark, indexOf, identity, first, second, maybeColor, maybeSort, titleGroup} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class Line extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z, // optional grouping for multiple series
      title,
      fill,
      stroke,
      curve,
      sort,
      transform = maybeSort(sort),
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill, "none");
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    if (z === undefined && vstroke != null) z = vstroke;
    if (z === undefined && vfill != null) z = vfill;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    this.curve = Curve(curve);
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke === "none" ? undefined : 1.5,
      strokeMiterlimit: cstroke === "none" ? undefined : 1,
      ...style
    });
  }
  render(I, {x, y, color}, {x: X, y: Y, z: Z, title: L, fill: F, stroke: S}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(Z ? group(I, Z) : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .attr("fill", F && (([i]) => color(F[i])))
            .attr("stroke", S && (([i]) => color(S[i])))
            .attr("d", shapeLine()
              .curve(this.curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => x(X[i]))
              .y(i => y(Y[i])))
            .call(titleGroup(L)))
      .node();
  }
}

export function line(data, {x = first, y = second, ...options} = {}) {
  return new Line(data, {...options, x, y});
}

export function lineX(data, {x = identity, ...options} = {}) {
  return new Line(data, {...options, x, y: indexOf});
}

export function lineY(data, {y = identity, ...options} = {}) {
  return new Line(data, {...options, x: indexOf, y});
}
