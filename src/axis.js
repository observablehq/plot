import {axisTop, axisBottom, axisRight, axisLeft, create, format, utcFormat} from "d3";
import {boolean, take, number, string, keyword, maybeKeyword, constant, isTemporal} from "./options.js";
import {formatIsoDate} from "./format.js";
import {radians} from "./math.js";
import {applyAttr, impliedString} from "./style.js";

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
    this.grid = boolean(grid);
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
    }
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
      tickRotate
    } = this;
    const offset = name === "x" ? 0 : axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    const offsetSign = axis === "top" ? -1 : 1;
    const ty = offsetSign * offset + (axis === "top" ? marginTop : height - marginBottom);
    return create("svg:g")
        .call(applyAria, this)
        .attr("transform", `translate(${offsetLeft},${ty})`)
        .call(createAxis(axis === "top" ? axisTop : axisBottom, x, this))
        .call(maybeTickRotate, tickRotate)
        .attr("font-size", null)
        .attr("font-family", null)
        .attr("font-variant", fontVariant)
        .call(!line ? g => g.select(".domain").remove() : () => {})
        .call(!grid ? () => {}
          : fy ? gridFacetX(index, fy, -ty)
          : gridX(offsetSign * (marginBottom + marginTop - height)))
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
    this.grid = boolean(grid);
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
    }
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
      tickRotate
    } = this;
    const offset = name === "y" ? 0 : axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    const offsetSign = axis === "left" ? -1 : 1;
    const tx = offsetSign * offset + (axis === "right" ? width - marginRight : marginLeft);
    return create("svg:g")
        .call(applyAria, this)
        .attr("transform", `translate(${tx},${offsetTop})`)
        .call(createAxis(axis === "right" ? axisRight : axisLeft, y, this))
        .call(maybeTickRotate, tickRotate)
        .attr("font-size", null)
        .attr("font-family", null)
        .attr("font-variant", fontVariant)
        .call(!line ? g => g.select(".domain").remove() : () => {})
        .call(!grid ? () => {}
          : fx ? gridFacetY(index, fx, -tx)
          : gridY(offsetSign * (marginLeft + marginRight - width)))
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

function gridX(y2) {
  return g => g.selectAll(".tick line")
    .clone(true)
      .attr("stroke-opacity", 0.1)
      .attr("y2", y2);
}

function gridY(x2) {
  return g => g.selectAll(".tick line")
    .clone(true)
      .attr("stroke-opacity", 0.1)
      .attr("x2", x2);
}

function gridFacetX(index, fy, ty) {
  const dy = fy.bandwidth();
  const domain = fy.domain();
  return g => g.selectAll(".tick")
    .append("path")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .attr("d", (index ? take(domain, index) : domain).map(v => `M0,${fy(v) + ty}v${dy}`).join(""));
}

function gridFacetY(index, fx, tx) {
  const dx = fx.bandwidth();
  const domain = fx.domain();
  return g => g.selectAll(".tick")
    .append("path")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .attr("d", (index ? take(domain, index) : domain).map(v => `M${fx(v) + tx},0h${dx}`).join(""));
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
