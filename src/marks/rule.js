import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter} from "../defined.js";
import {Mark, identity, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyBandTransform} from "../style.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x = identity,
      y1,
      y2,
      z,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke = vstroke == null ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {stroke: cstroke, ...style});
  }
  render(
    I,
    {x, y, color},
    {x: X, y1: Y1, y2: Y2, z: Z, stroke: S},
    {marginTop, height, marginBottom}
  ) {
    const index = filter(I, X, Y1, Y2, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyBandTransform, x, false)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", i => Math.round(x(X[i])) + 0.5)
            .attr("x2", i => Math.round(x(X[i])) + 0.5)
            .attr("y1", Y1 ? i => y(Y1[i]) : marginTop)
            .attr("y2", Y2 ? (y.bandwidth ? i => y(Y2[i]) + y.bandwidth() : i => y(Y2[i])) : height - marginBottom)
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export class RuleY extends Mark {
  constructor(
    data,
    {
      x1,
      x2,
      y = identity,
      z,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke = vstroke == null ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "y", value: y, scale: "y"},
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {stroke: cstroke, ...style});
  }
  render(
    I,
    {x, y, color},
    {y: Y, x1: X1, x2: X2, z: Z, stroke: S},
    {width, marginLeft, marginRight}
  ) {
    const index = filter(I, Y, X1, X2);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyBandTransform, false, y)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X1 ? i => x(X1[i]) : marginLeft)
            .attr("x2", X2 ? (x.bandwidth ? i => x(X2[i]) + x.bandwidth() : i => x(X2[i])) : width - marginRight)
            .attr("y1", i => Math.round(y(Y[i])) + 0.5)
            .attr("y2", i => Math.round(y(Y[i])) + 0.5)
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export function ruleX(data, options) {
  return new RuleX(data, options);
}

export function ruleY(data, options) {
  return new RuleY(data, options);
}
