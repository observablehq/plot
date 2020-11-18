import {create} from "d3-selection";
import {identity} from "../mark.js";
import {Mark} from "../mark.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x = identity,
      y1,
      y2,
      stroke
    } = {},
    {
      stroke: fixedStroke = stroke === undefined ? "currentColor" : undefined,
      strokeWidth,
      strokeOpacity
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
    this.stroke = fixedStroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
  }
  render(
    I,
    {
      x: {scale: x},
      y: {scale: y} = {},
      color: {scale: color} = {}
    },
    {marginTop, height, marginBottom}
  ) {
    const {
      stroke,
      strokeWidth,
      strokeOpacity,
      channels: {
        x: {value: X},
        y1: {value: Y1} = {},
        y2: {value: Y2} = {},
        stroke: {value: S} = {}
      }
    } = this;
    return create("svg:g")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll("line")
          .data(I)
          .join("line")
            .attr("stroke", S && (i => color(S[i])))
            .attr("x1", i => Math.round(x(X[i])) + 0.5) // TODO round
            .attr("x2", i => Math.round(x(X[i])) + 0.5) // TODO round
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
      stroke
    } = {},
    {
      stroke: fixedStroke = stroke === undefined ? "currentColor" : undefined,
      strokeWidth,
      strokeOpacity
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
    this.stroke = fixedStroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
  }
  render(
    I,
    {
      y: {scale: y},
      x: {scale: x} = {},
      color: {scale: color} = {}
    },
    {width, marginLeft, marginRight}
  ) {
    const {
      stroke,
      strokeWidth,
      strokeOpacity,
      channels: {
        y: {value: Y},
        x1: {value: X1} = {},
        x2: {value: X2} = {},
        stroke: {value: S} = {}
      }
    } = this;
    return create("svg:g")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll("line")
          .data(I)
          .join("line")
            .attr("stroke", S && (i => color(S[i])))
            .attr("x1", X1 ? i => x(X1[i]) : marginLeft)
            .attr("x2", X2 ? i => x(X2[i]) : width - marginRight)
            .attr("y1", i => Math.round(y(Y[i])) + 0.5) // TODO round?
            .attr("y2", i => Math.round(y(Y[i])) + 0.5)) // TODO round?
      .node();
  }
}

export function ruleX(data, channels, style) {
  return new RuleX(data, channels, style);
}

export function ruleY(data, channels, style) {
  return new RuleY(data, channels, style);
}
