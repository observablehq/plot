import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark, identity} from "../mark.js";
import {Style, applyStyles} from "../style.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x = identity,
      y1,
      y2,
      z,
      stroke,
      style
    } = {}
  ) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style({stroke: "currentColor", ...style});
  }
  render(
    I,
    {x, y, color},
    {x: X, y1: Y1, y2: Y2, z: Z, stroke: S},
    {marginTop, height, marginBottom}
  ) {
    const {style} = this;
    let index = I.filter(i => defined(X[i]));
    if (Y1) index = index.filter(i => defined(Y1[i]));
    if (Y2) index = index.filter(i => defined(Y2[i]));
    if (S) index = index.filter(i => defined(S[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyStyles, style)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .attr("x1", i => Math.round(x(X[i])) + 0.5)
            .attr("x2", i => Math.round(x(X[i])) + 0.5)
            .attr("y1", Y1 ? i => y(Y1[i]) : marginTop)
            .attr("y2", Y2 ? i => y(Y2[i]) : height - marginBottom)
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
      style
    } = {}
  ) {
    super(
      data,
      [
        {name: "y", value: y, scale: "y"},
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style({stroke: "currentColor", ...style});
  }
  render(
    I,
    {x, y, color},
    {y: Y, x1: X1, x2: X2, z: Z, stroke: S},
    {width, marginLeft, marginRight}
  ) {
    const {style} = this;
    let index = I.filter(i => defined(Y[i]));
    if (X1) index = index.filter(i => defined(X1[i]));
    if (X2) index = index.filter(i => defined(X2[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyStyles, style)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .attr("x1", X1 ? i => x(X1[i]) : marginLeft)
            .attr("x2", X2 ? i => x(X2[i]) : width - marginRight)
            .attr("y1", i => Math.round(y(Y[i])) + 0.5)
            .attr("y2", i => Math.round(y(Y[i])) + 0.5)
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export function ruleX(data, channels, style) {
  return new RuleX(data, channels, style);
}

export function ruleY(data, channels, style) {
  return new RuleY(data, channels, style);
}
