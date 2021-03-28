import {group} from "d3";
import {create} from "d3";
import {line as shapeLine} from "d3";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity, maybeColor, maybeTuple, titleGroup} from "../mark.js";
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
      tension,
      ...options
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
      options
    );
    this.curve = Curve(curve, tension);
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke === "none" ? undefined : 1.5,
      strokeMiterlimit: cstroke === "none" ? undefined : 1,
      ...options
    });
  }
  render(I, {x, y}, {x: X, y: Y, z: Z, title: L, fill: F, stroke: S}) {
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, this)
            .attr("fill", F && (([i]) => F[i]))
            .attr("stroke", S && (([i]) => S[i]))
            .attr("d", shapeLine()
              .curve(this.curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => X[i])
              .y(i => Y[i]))
            .call(titleGroup(L)))
      .node();
  }
}

export function line(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Line(data, {...options, x, y});
}

export function lineX(data, {x = identity, y = indexOf, ...options} = {}) {
  return new Line(data, {...options, x, y});
}

export function lineY(data, {x = indexOf, y = identity, ...options} = {}) {
  return new Line(data, {...options, x, y});
}
