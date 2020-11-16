import {create} from "d3-selection";
import {identity} from "../channels.js";

export class RuleX {
  constructor(
    data, {
      x = identity,
      stroke = "currentColor",
      strokeWidth,
      strokeOpacity
    } = {}) {
    this.data = data;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.channels = {x: {value: x, scale: "x"}};
  }
  render(I, {x: {scale: x}}, {marginTop, height, marginBottom}) {
    const {
      stroke,
      strokeWidth,
      strokeOpacity,
      channels: {
        x: {value: X}
      }
    } = this;
    return create("svg:g")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
      .call(g => g.selectAll("line")
      .data(I)
      .join("line")
        .attr("x1", i => Math.round(x(X[i])) + 0.5) // TODO round
        .attr("x2", i => Math.round(x(X[i])) + 0.5) // TODO round
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom))
      .node();
  }
}

export class RuleY {
  constructor(
    data,
    {
      y = identity,
      stroke = "currentColor",
      strokeWidth,
      strokeOpacity
    } = {}
  ) {
    this.data = data;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.channels = {y: {value: y, scale: "y"}};
  }
  render(I, {y: {scale: y}}, {width, marginLeft, marginRight}) {
    const {
      stroke,
      strokeWidth,
      strokeOpacity,
      channels: {
        y: {value: Y}
      }
    } = this;
    return create("svg:g")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
      .call(g => g.selectAll("line")
      .data(I)
      .join("line")
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight)
        .attr("y1", i => Math.round(y(Y[i])) + 0.5) // TODO round?
        .attr("y2", i => Math.round(y(Y[i])) + 0.5)) // TODO round?
      .node();
  }
}
