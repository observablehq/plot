import {axisTop, axisBottom, axisRight, axisLeft, format, utcFormat} from "d3";
import {create} from "./context.js";
import {formatIsoDate} from "./format.js";
import {radians} from "./math.js";
import {boolean, take, number, string, keyword, maybeKeyword, constant, isTemporal} from "./options.js";
import {applyAttr, impliedString, offset} from "./style.js";

export class AxisX {
  constructor({
    name = "x",
    axis,
    ticks,
    tickSize = name === "fx" ? 0 : 6,
    tickPadding = tickSize === 0 ? 9 : 3,
    tickFormat,
    fontVariant,
    grid,
    label,
    labelAnchor,
    labelOffset,
    line,
    tickRotate,
    ariaLabel,
    ariaDescription
  } = {}) {
    this.name = name;
    this.axis = keyword(axis, "axis", ["top", "bottom"]);
    this.ticks = maybeTicks(ticks);
    this.tickSize = number(tickSize);
    this.tickPadding = number(tickPadding);
    this.tickFormat = maybeTickFormat(tickFormat);
    this.fontVariant = impliedString(fontVariant, "normal");
    this.grid = maybeGrid(grid);
    this.label = string(label);
    this.labelAnchor = maybeKeyword(labelAnchor, "labelAnchor", ["center", "left", "right"]);
    this.labelOffset = number(labelOffset);
    this.line = boolean(line);
    this.tickRotate = number(tickRotate);
    this.ariaLabel = string(ariaLabel);
    this.ariaDescription = string(ariaDescription);
  }
  render(
    index,
    {[this.name]: x, fy},
    {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      offsetLeft = 0,
      facetMarginTop,
      facetMarginBottom,
      labelMarginLeft = 0,
      labelMarginRight = 0
    },
    context
  ) {
    const {
      axis,
      fontVariant,
      grid,
      label,
      labelAnchor,
      labelOffset,
      line,
      name,
      tickRotate,
      ticks
    } = this;
    const offset = name === "x" ? 0 : axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    const offsetSign = axis === "top" ? -1 : 1;
    const ty = offsetSign * offset + (axis === "top" ? marginTop : height - marginBottom);
    return create("svg:g", context)
        .call(applyAria, this)
        .attr("transform", `translate(${offsetLeft},${ty})`)
        .call(!grid ? () => {}
        : createGridX(
          grid(x, ticks),
          x,
          fy ? fy.bandwidth() : offsetSign * (marginBottom + marginTop - height),
          fy ? (index ? take(fy.domain(), index) : fy.domain()).map(d => fy(d) - ty) : [0]
        ))
        .call(createAxis(axis === "top" ? axisTop : axisBottom, x, this))
        .call(maybeTickRotate, tickRotate)
        .attr("font-size", null)
        .attr("font-family", null)
        .attr("font-variant", fontVariant)
        .call(!line ? g => g.select(".domain").remove() : () => {})
        .call(!label ? () => {} : g => g.append("text")
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
    fontVariant,
    grid,
    label,
    labelAnchor,
    labelOffset,
    line,
    tickRotate,
    ariaLabel,
    ariaDescription
  } = {}) {
    this.name = name;
    this.axis = keyword(axis, "axis", ["left", "right"]);
    this.ticks = maybeTicks(ticks);
    this.tickSize = number(tickSize);
    this.tickPadding = number(tickPadding);
    this.tickFormat = maybeTickFormat(tickFormat);
    this.fontVariant = impliedString(fontVariant, "normal");
    this.grid = maybeGrid(grid);
    this.label = string(label);
    this.labelAnchor = maybeKeyword(labelAnchor, "labelAnchor", ["center", "top", "bottom"]);
    this.labelOffset = number(labelOffset);
    this.line = boolean(line);
    this.tickRotate = number(tickRotate);
    this.ariaLabel = string(ariaLabel);
    this.ariaDescription = string(ariaDescription);
  }
  render(
    index,
    {[this.name]: y, fx},
    {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      offsetTop = 0,
      facetMarginLeft,
      facetMarginRight
    },
    context
  ) {
    const {
      axis,
      fontVariant,
      grid,
      label,
      labelAnchor,
      labelOffset,
      line,
      name,
      tickRotate,
      ticks
    } = this;
    const offset = name === "y" ? 0 : axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    const offsetSign = axis === "left" ? -1 : 1;
    const tx = offsetSign * offset + (axis === "right" ? width - marginRight : marginLeft);
    return create("svg:g", context)
        .call(applyAria, this)
        .attr("transform", `translate(${tx},${offsetTop})`)
        .call(!grid ? () => {}
          : createGridY(
              grid(y, ticks),
              y,
              fx ? fx.bandwidth() : offsetSign * (marginLeft + marginRight - width),
              fx ? (index ? take(fx.domain(), index) : fx.domain()).map(d => fx(d) - tx) : [0]
            ))
        .call(createAxis(axis === "right" ? axisRight : axisLeft, y, this))
        .call(maybeTickRotate, tickRotate)
        .attr("font-size", null)
        .attr("font-family", null)
        .attr("font-variant", fontVariant)
        .call(!line ? g => g.select(".domain").remove() : () => {})
        .call(!label ? () => {} : g => g.append("text")
            .attr("fill", "currentColor")
            .attr("font-variant", fontVariant == null ? null : "normal")
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

function applyAria(selection, {
  name,
  label,
  ariaLabel = `${name}-axis`,
  ariaDescription = label
}) {
  applyAttr(selection, "aria-label", ariaLabel);
  applyAttr(selection, "aria-description", ariaDescription);
}

function maybeTicks(ticks) {
  return ticks === null ? [] : ticks;
}

function maybeTickFormat(tickFormat) {
  return tickFormat === null ? () => null : tickFormat;
}

// D3 doesn’t provide a tick format for ordinal scales; we want shorthand when
// an ordinal domain is numbers or dates, and we want null to mean the empty
// string, not the default identity format.
export function maybeAutoTickFormat(tickFormat, domain) {
  return tickFormat === undefined ? (isTemporal(domain) ? formatIsoDate : string)
      : typeof tickFormat === "function" ? tickFormat
      : (typeof tickFormat === "string" ? (isTemporal(domain) ? utcFormat : format)
      : constant)(tickFormat);
}

function createAxis(axis, scale, {ticks, tickSize, tickPadding, tickFormat}) {
  if (!scale.tickFormat) {
    tickFormat = maybeAutoTickFormat(tickFormat, scale.domain());
  }
  return axis(scale)
    .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "function" ? null : tickFormat)
    .tickFormat(typeof tickFormat === "function" ? tickFormat : null)
    .tickSizeInner(tickSize)
    .tickSizeOuter(0)
    .tickPadding(tickPadding)
    .tickValues(Array.isArray(ticks) ? ticks : null);
}

function maybeTickRotate(g, rotate) {
  if (!(rotate = +rotate)) return;
  for (const text of g.selectAll("text")) {
    const x = +text.getAttribute("x");
    const y = +text.getAttribute("y");
    if (Math.abs(y) > Math.abs(x)) {
      const s = Math.sign(y);
      text.setAttribute("transform", `translate(0, ${y + s * 4 * Math.cos(rotate * radians)}) rotate(${rotate})`);
      text.setAttribute("text-anchor", Math.abs(rotate) < 10 ? "middle" : (rotate < 0) ^ (s > 0) ? "start" : "end");
    } else {
      const s = Math.sign(x);
      text.setAttribute("transform", `translate(${x + s * 4 * Math.abs(Math.sin(rotate * radians))}, 0) rotate(${rotate})`);
      text.setAttribute("text-anchor", Math.abs(rotate) > 60 ? "middle" : s > 0 ? "start" : "end");
    }
    text.removeAttribute("x");
    text.removeAttribute("y");
    text.setAttribute("dy", "0.32em");
  }
}

function createGridX(ticks, x, dy, steps) {
  return g => g.append("g")
      .attr("class", "grid")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", "0.1")
      .selectAll()
      .data(steps)
      .join("g")
        .attr("transform", v => `translate(${offset},${v})`)
        .selectAll()
        .data(ticks)
        .join("path")
        .attr("d", d => `M${x(d)},0v${dy}`);
}

function createGridY(ticks, y, dx, steps) {
  return g => g.append("g")
      .attr("class", "grid")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", "0.1")
      .selectAll()
      .data(steps)
      .join("g")
        .attr("transform", v => `translate(${v},${offset})`)
        .selectAll()
        .data(ticks)
        .join("path")
        .attr("d", d => `M0,${y(d)}h${dx}`);
}

function maybeGrid(grid) {
  if (!grid) return false;
  if (grid === true) return (scale, ticks) => (scale.ticks ? scale.ticks(ticks) : scale.domain());
  if (Array.isArray(grid)) return constant(grid.map(d => d == null ? null : +d).filter(d => !isNaN(d)));
  if (grid === +grid) return (scale) => (scale.ticks ? scale.ticks.apply(scale, [grid]) : scale.domain());
  throw new Error(`Unexpected grid option: ${grid}`);
}
