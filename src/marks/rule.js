import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter} from "../defined.js";
import {Mark, identity, maybeColor, zero, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x,
      y1,
      y2,
      z,
      title,
      stroke,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    Style(this, {stroke: cstroke, ...options});
  }
  render(
    I,
    {x, y, color},
    {x: X, y1: Y1, y2: Y2, z: Z, title: L, stroke: S},
    {marginTop, height, marginBottom}
  ) {
    const index = filter(I, X, Y1, Y2, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, false, 0.5, 0)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", i => Math.round(x(X[i])))
            .attr("x2", i => Math.round(x(X[i])))
            .attr("y1", Y1 ? i => y(Y1[i]) : marginTop)
            .attr("y2", Y2 ? (y.bandwidth ? i => y(Y2[i]) + y.bandwidth() : i => y(Y2[i])) : height - marginBottom)
            .attr("stroke", S && (i => color(S[i])))
            .call(title(L)))
      .node();
  }
}

export class RuleY extends Mark {
  constructor(
    data,
    {
      x1,
      x2,
      y,
      z,
      title,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    super(
      data,
      [
        {name: "y", value: y, scale: "y"},
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {stroke: cstroke, ...style});
  }
  render(
    I,
    {x, y, color},
    {y: Y, x1: X1, x2: X2, z: Z, title: L, stroke: S},
    {width, marginLeft, marginRight}
  ) {
    const index = filter(I, Y, X1, X2);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, false, y, 0, 0.5)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X1 ? i => x(X1[i]) : marginLeft)
            .attr("x2", X2 ? (x.bandwidth ? i => x(X2[i]) + x.bandwidth() : i => x(X2[i])) : width - marginRight)
            .attr("y1", i => Math.round(y(Y[i])))
            .attr("y2", i => Math.round(y(Y[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(title(L)))
      .node();
  }
}

export function ruleX(data, {x = identity, y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeOptionalZero(y, y1, y2));
  return new RuleX(data, {...options, x, y1, y2});
}

export function ruleY(data, {y = identity, x, x1, x2, ...options} = {}) {
  ([x1, x2] = maybeOptionalZero(x, x1, x2));
  return new RuleY(data, {...options, y, x1, x2});
}

// For marks specified either as [0, x] or [x1, x2], or nothing.
function maybeOptionalZero(x, x1, x2) {
  if (x === undefined) {
    if (x1 === undefined) {
      if (x2 !== undefined) return [zero, x2];
    } else {
      if (x2 === undefined) return [zero, x1];
    }
  } else if (x1 === undefined) {
    return x2 === undefined ? [zero, x] : [x, x2];
  } else if (x2 === undefined) {
    return [x, x1];
  }
  return [x1, x2];
}
