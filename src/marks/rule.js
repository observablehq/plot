import {create} from "d3-selection";

export class RuleX {
  constructor({x} = {}) {
    this.channels = {
      x: {value: x, scale: "x"}
    };
  }
  render({x: {scale: x}}, {marginTop, height, marginBottom}) {
    return create("svg:g")
        .attr("stroke", "currentColor")
      .call(g => g.selectAll("line")
      .data(this.channels.x.value)
      .join("line")
        .attr("x1", d => Math.round(x(d)) + 0.5) // TODO round
        .attr("x2", d => Math.round(x(d)) + 0.5) // TODO round
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom))
      .node();
  }
}

export class RuleY {
  constructor({y} = {}) {
    this.channels = {
      y: {value: y, scale: "y"}
    };
    console.log(this.channels);
  }
  render({y: {scale: y}}, {width, marginLeft, marginRight}) {
    return create("svg:g")
        .attr("stroke", "currentColor")
      .call(g => g.selectAll("line")
      .data(this.channels.y.value)
      .join("line")
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight)
        .attr("y1", d => Math.round(y(d)) + 0.5) // TODO round?
        .attr("y2", d => Math.round(y(d)) + 0.5)) // TODO round?
      .node();
  }
}
