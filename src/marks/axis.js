import {axisTop, axisBottom, axisRight, axisLeft} from "d3-axis";
import {interpolateRound} from "d3-interpolate";
import {create} from "d3-selection";

export class AxisX {
  constructor({
    axis = true,
    ticks,
    tickSize = 6,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.axis = axis === true ? "bottom" : axis;
    this.ticks = ticks;
    this.tickSize = tickSize;
    this.tickFormat = tickFormat;
    this.grid = grid;
    this.label = label;
    this.labelAnchor = labelAnchor;
    this.labelOffset = labelOffset;
  }
  render(
    index,
    {x},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {
      axis,
      ticks,
      tickSize,
      tickFormat,
      grid,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offsetSign = axis === "top" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(0,${axis === "top" ? marginTop : height - marginBottom})`)
        .call((axis === "top" ? axisTop : axisBottom)(round(x))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !x.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .call(g => g.select(".domain").remove())
        .call(!grid ? () => {} : g => g.selectAll(".tick line").clone(true)
            .attr("stroke-opacity", 0.1)
            .attr("y2", offsetSign * (marginBottom + marginTop - height)))
        .call(label == null ? () => {} : g => g.append("text")
            .attr("fill", "currentColor")
            .attr("transform", `translate(${
                labelAnchor === "center" ? (width + marginLeft - marginRight) / 2
                  : labelAnchor === "right" ? width
                  : 0
              },${labelOffset * offsetSign})`)
            .attr("dy", axis === "top" ? "1em" : "-0.32em")
            .attr("text-anchor", labelAnchor === "center" ? "middle"
                : labelAnchor === "right" ? "end"
                : "start")
            .text(label))
      .node();
  }
}

export class AxisY {
  constructor({
    axis = true,
    ticks,
    tickSize = 6,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.axis = axis === true ? "left" : axis;
    this.ticks = ticks;
    this.tickSize = tickSize;
    this.tickFormat = tickFormat;
    this.grid = grid;
    this.label = label;
    this.labelAnchor = labelAnchor;
    this.labelOffset = labelOffset;
  }
  render(
    index,
    {y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {
      axis,
      ticks,
      tickSize,
      tickFormat,
      grid,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offsetSign = axis === "left" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(${axis === "right" ? width - marginRight : marginLeft},0)`)
        .call((axis === "right" ? axisRight : axisLeft)(round(y))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !y.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .call(g => g.select(".domain").remove())
        .call(!grid ? () => {} : g => g.selectAll(".tick line").clone(true)
            .attr("stroke-opacity", 0.1)
            .attr("x2", offsetSign * (marginLeft + marginRight - width)))
        .call(label == null ? () => {} : g => g.append("text")
            .attr("fill", "currentColor")
            .attr("transform", `translate(${labelOffset * offsetSign},${
                labelAnchor === "center" ? (height + marginTop - marginBottom) / 2
                  : labelAnchor === "bottom" ? height - marginBottom
                  : marginTop
              })${labelAnchor === "center" ? ` rotate(-90)` : ""}`)
            .attr("dy", labelAnchor === "center" ? (axis === "right" ? "-0.32em" : "0.75em")
                : labelAnchor === "bottom" ? "1.4em"
                : "-1em")
            .attr("text-anchor", labelAnchor === "center" ? "middle"
                : axis === "right" ? "end"
                : "start")
            .text(label))
      .node();
  }
}

function round(scale) {
  return scale.round // TODO round band and point scales?
      ? scale
      : scale.copy().interpolate(interpolateRound);
}
