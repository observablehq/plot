import {axisTop, axisBottom, axisRight, axisLeft} from "d3-axis";
import {interpolateRound} from "d3-interpolate";
import {create} from "d3-selection";

export class AxisX {
  constructor({
    name = "x",
    axis,
    ticks,
    tickSize = 6,
    tickFormat,
    grid,
    label,
    labelAnchor,
    labelOffset
  } = {}) {
    this.name = name;
    this.axis = (axis + "").toLowerCase();
    if (!["top", "bottom"].includes(axis)) throw new Error(`invalid x-axis: ${axis}`);
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
    {[this.name]: x, fy},
    channels,
    {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      facetMarginTop,
      facetMarginBottom
    }
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
    const offset = this.name === "x" ? 0 : axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    const offsetSign = axis === "top" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(0,${offsetSign * offset + (axis === "top" ? marginTop : height - marginBottom)})`)
        .call((axis === "top" ? axisTop : axisBottom)(round(x))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !x.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .attr("font-size", null)
        .attr("font-family", null)
        .call(g => g.select(".domain").remove())
        .call(!grid
          ? () => {}
          : gridX(fy, {height, marginBottom, marginTop, offsetSign})
        )
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
    name = "y",
    axis,
    ticks,
    tickSize = 6,
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
    this.tickFormat = tickFormat;
    this.grid = grid;
    this.label = label;
    this.labelAnchor = labelAnchor;
    this.labelOffset = labelOffset;
  }
  render(
    index,
    {[this.name]: y, fx},
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
      tickFormat,
      grid,
      label,
      labelAnchor,
      labelOffset
    } = this;
    const offset = this.name === "y" ? 0 : axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    const offsetSign = axis === "left" ? -1 : 1;
    return create("svg:g")
        .attr("transform", `translate(${offsetSign * offset + (axis === "right" ? width - marginRight : marginLeft)},0)`)
        .call((axis === "right" ? axisRight : axisLeft)(round(y))
            .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
            .tickFormat(typeof tickFormat === "function" || !y.tickFormat ? tickFormat : null)
            .tickSizeInner(tickSize)
            .tickSizeOuter(0)
            .tickValues(Array.isArray(ticks) ? ticks : null))
        .attr("font-size", null)
        .attr("font-family", null)
        .call(g => g.select(".domain").remove())
        .call(!grid
          ? () => {}
          : gridY(fx, {marginLeft, marginRight, offsetSign, width})
        )
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
  return scale.interpolate // TODO round band and point scales?
      ? scale.copy().interpolate(interpolateRound)
      : scale;
}

function gridX(fy, {height, marginBottom, marginTop, offsetSign}) {
  return fy
  ? g => {
    const t = g.selectAll(".tick line");
    const bw = fy.bandwidth();
      for (const y of fy.domain().map(fy)) {
        t.clone(true)
          .attr("stroke-opacity", 0.1)
          .attr("y1", offsetSign * (y + bw + marginBottom - height))
          .attr("y2", offsetSign * (y + marginBottom - height));
      }
    }
  : g => g.selectAll(".tick line").clone(true)
      .attr("stroke-opacity", 0.1)
      .attr("y2", offsetSign * (marginBottom + marginTop - height));
}

function gridY(fx, {marginLeft, marginRight, offsetSign, width}) {
  return fx
  ? g => {
      const bw = fx.bandwidth();
      const t = g.selectAll(".tick line");
      for (const x of fx.domain().map(fx)) {
        t.clone(true)
          .attr("stroke-opacity", 0.1)
          .attr("x1", offsetSign * (x + bw + marginRight - width))
          .attr("x2", offsetSign * (x + marginRight - width));
      }
    }
  : g => g.selectAll(".tick line").clone(true)
      .attr("stroke-opacity", 0.1)
      .attr("x2", offsetSign * (marginLeft + marginRight - width));
}
