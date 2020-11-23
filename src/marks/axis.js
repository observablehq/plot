import {axisTop, axisBottom, axisRight, axisLeft} from "d3-axis";
import {interpolateRound} from "d3-interpolate";
import {create} from "d3-selection";

export class AxisX {
  constructor({
    anchor = "bottom",
    ticks,
    tickSize = 6,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.anchor = anchor;
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
      anchor,
      ticks,
      tickSize,
      tickFormat,
      grid,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offsetSign = anchor === "top" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(0,${anchor === "top" ? marginTop : height - marginBottom})`)
        .call((anchor === "top" ? axisTop : axisBottom)(round(x))
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
            .attr("dy", anchor === "top" ? "1em" : "-0.32em")
            .attr("text-anchor", labelAnchor === "center" ? "middle"
                : labelAnchor === "right" ? "end"
                : "start")
            .text(label))
      .node();
  }
}

export class AxisY {
  constructor({
    anchor = "left",
    ticks,
    tickSize = 6,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.anchor = anchor;
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
      anchor,
      ticks,
      tickSize,
      tickFormat,
      grid,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offsetSign = anchor === "left" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(${anchor === "right" ? width - marginRight : marginLeft},0)`)
        .call((anchor === "right" ? axisRight : axisLeft)(round(y))
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
            .attr("dy", labelAnchor === "center" ? (anchor === "right" ? "-0.32em" : "0.75em")
                : labelAnchor === "bottom" ? "1.4em"
                : "-1em")
            .attr("text-anchor", labelAnchor === "center" ? "middle"
                : anchor === "right" ? "end"
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
