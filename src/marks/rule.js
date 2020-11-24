import {create} from "d3-selection";
import {Mark, identity} from "../mark.js";
import {Style, applyStyles} from "../style.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x = identity,
      y1,
      y2,
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
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style({stroke: "currentColor", ...style});
  }
  render(
    I,
    {x, y, color},
    {x: X, y1: Y1, y2: Y2, stroke: S},
    {marginTop, height, marginBottom}
  ) {
    const {style} = this;
    return create("svg:g")
        .call(applyStyles, style)
        .call(g => g.selectAll("line")
          .data(I)
          .join("line")
            .attr("stroke", S && (i => color(S[i])))
            .attr("x1", i => Math.round(x(X[i])) + 0.5)
            .attr("x2", i => Math.round(x(X[i])) + 0.5)
            .attr("y1", Y1 ? i => y(Y1[i]) : marginTop)
            .attr("y2", Y2 ? i => y(Y2[i]) : height - marginBottom))
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
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style({stroke: "currentColor", ...style});
  }
  render(
    I,
    {x, y, color},
    {y: Y, x1: X1, x2: X2, stroke: S},
    {width, marginLeft, marginRight}
  ) {
    const {style} = this;
    return create("svg:g")
        .call(applyStyles, style)
        .call(g => g.selectAll("line")
          .data(I)
          .join("line")
            .attr("stroke", S && (i => color(S[i])))
            .attr("x1", X1 ? i => x(X1[i]) : marginLeft)
            .attr("x2", X2 ? i => x(X2[i]) : width - marginRight)
            .attr("y1", i => Math.round(y(Y[i])) + 0.5)
            .attr("y2", i => Math.round(y(Y[i])) + 0.5))
      .node();
  }
}

export function ruleX(data, channels, style) {
  return new RuleX(data, channels, style);
}

export function ruleY(data, channels, style) {
  return new RuleY(data, channels, style);
}
