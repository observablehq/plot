import {create} from "d3-selection";

export function RuleX(value) {
  return (x, y, {height, marginTop, marginBottom}) => create("svg:line")
      .attr("stroke", "currentColor")
      .attr("x1", Math.round(x(value)) + 0.5)
      .attr("x2", Math.round(x(value)) + 0.5)
      .attr("y1", marginTop)
      .attr("y2", height - marginBottom)
    .node();
}

export function RuleY(value) {
  return (x, y, {width, marginLeft, marginRight}) => create("svg:line")
      .attr("stroke", "currentColor")
      .attr("x1", marginLeft)
      .attr("x2", width - marginRight)
      .attr("y1", Math.round(y(value)) + 0.5)
      .attr("y2", Math.round(y(value)) + 0.5)
    .node();
}
