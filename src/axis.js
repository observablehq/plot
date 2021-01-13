import {axisTop, axisBottom, axisRight, axisLeft} from "d3-axis";
import {interpolateRound} from "d3-interpolate";
import {create} from "d3-selection";

export class AxisX {
  constructor({
    name = "x",
    axis,
    ticks,
    tickSize = name === "fx" ? 0 : 6,
    tickPadding = tickSize === 0 ? 9 : 3,
    tickFormat,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.name = name;
    this.axis = (axis + "").toLowerCase();
    if (!["top", "bottom"].includes(axis)) throw new Error(`invalid x-axis: ${axis}`);
    this.ticks = ticks;
    this.tickSize = tickSize;
    this.tickPadding = tickPadding;
    this.tickFormat = tickFormat;
    this.label = label;
    this.labelAnchor = labelAnchor;
    this.labelOffset = labelOffset;
  }
  render(
    index,
    {[this.name]: x},
    channels,
    {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      facetMarginTop,
      facetMarginBottom,
      labelMarginLeft = 0,
      labelMarginRight = 0
    }
  ) {
    const {
      axis,
      ticks,
      tickSize,
      tickPadding,
      tickFormat,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offset = this.name === "x" ? 0 : axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    const offsetSign = axis === "top" ? -1 : 1;
    const ty = offsetSign * offset + (axis === "top" ? marginTop : height - marginBottom);
    return create("svg:g")
        .attr("transform", `translate(0,${ty})`)
        .call((axis === "top" ? axisTop : axisBottom)(round(x))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !x.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickPadding(tickPadding)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .attr("font-size", null)
        .attr("font-family", null)
        .call(g => g.select(".domain").remove())
        .call(label == null ? () => {} : g => g.append("text")
            .attr("fill", "currentColor")
            .attr("transform", `translate(${
                labelAnchor === "center" ? (width + marginLeft - marginRight) / 2
                  : labelAnchor === "right" ? width + labelMarginRight
                  : -labelMarginLeft
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
    name = "y",
    axis,
    ticks,
    tickSize = name === "fy" ? 0 : 6,
    tickPadding = tickSize === 0 ? 9 : 3,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.name = name;
    this.axis = axis = (axis + "").toLowerCase();
    if (!["left", "right"].includes(axis)) throw new Error(`invalid y-axis: ${axis}`);
    this.ticks = ticks;
    this.tickSize = tickSize;
    this.tickPadding = tickPadding;
    this.tickFormat = tickFormat;
    this.grid = grid;
    this.label = label;
    this.labelAnchor = labelAnchor;
    this.labelOffset = labelOffset;
  }
  render(
    index,
    {[this.name]: y},
    channels,
    {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      facetMarginLeft,
      facetMarginRight
    }
  ) {
    const {
      axis,
      ticks,
      tickSize,
      tickPadding,
      tickFormat,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offset = this.name === "y" ? 0 : axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    const offsetSign = axis === "left" ? -1 : 1;
    const tx = offsetSign * offset + (axis === "right" ? width - marginRight : marginLeft);
    return create("svg:g")
        .attr("transform", `translate(${tx},0)`)
        .call((axis === "right" ? axisRight : axisLeft)(round(y))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !y.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickPadding(tickPadding)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .attr("font-size", null)
        .attr("font-family", null)
        .call(g => g.select(".domain").remove())
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

export class GridX {
  constructor({
    name = "x",
    ticks
  } = {}) {
    this.name = name;
    this.ticks = ticks;
  }
  render(
    index,
    {[this.name]: x},
    channels,
    {
      height,
      marginTop,
      marginBottom
    }
  ) {
    const { ticks } = this;
    return create("svg:g")
        .attr("transform", `translate(0,${marginTop})`)
        .attr("stroke-opacity", 0.1)
        .call(axisTop(round(x))
            .ticks(Array.isArray(ticks) ? null : ticks)
            .tickValues(Array.isArray(ticks) ? ticks : null)
            .tickSize(marginTop + marginBottom - height))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").remove())
      .node();
  }
}

export class GridY {
  constructor({
    name = "y",
    ticks
  } = {}) {
    this.name = name;
    this.ticks = ticks;
  }
  render(
    index,
    {[this.name]: y},
    channels,
    {
      width,
      marginLeft,
      marginRight
    }
  ) {
    const { ticks } = this;
    return create("svg:g")
        .attr("transform", `translate(${marginLeft},0)`)
        .attr("stroke-opacity", 0.1)
        .call(axisLeft(round(y))
            .ticks(Array.isArray(ticks) ? null : ticks)
            .tickValues(Array.isArray(ticks) ? ticks : null)
            .tickSize(marginLeft + marginRight - width))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text").remove())
      .node();
  }
}

function round(scale) {
  return scale.interpolate // TODO round band and point scales?
      ? scale.copy().interpolate(interpolateRound)
      : scale;
}

