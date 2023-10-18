import {area as shapeArea, line as shapeLine} from "d3";
import {create} from "../context.js";
import {maybeCurve} from "../curve.js";
import {Mark, withTip} from "../mark.js";
import {identity, indexOf, isColor, number} from "../options.js";
import {applyIndirectStyles, applyTransform, getClipId, groupIndex} from "../style.js";

const defaults = {
  ariaLabel: "difference",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

function maybeColor(value) {
  if (value == null) return "none";
  if (!isColor(value)) throw new Error(`invalid color: ${value}`);
  return value;
}

class DifferenceY extends Mark {
  constructor(data, options = {}) {
    const {
      x1,
      y1,
      x2,
      y2,
      curve,
      tension,
      positiveColor = "#01ab63",
      negativeColor = "#4269d0",
      opacity = 1,
      positiveOpacity = opacity,
      negativeOpacity = opacity
    } = options;
    super(
      data,
      {
        x1: {value: x1, scale: "x"},
        y1: {value: y1, scale: "y"},
        x2: {value: x2 === x1 ? undefined : x2, scale: "x", optional: true},
        y2: {value: y2 === y1 ? undefined : y2, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this.curve = maybeCurve(curve, tension);
    this.positiveColor = maybeColor(positiveColor);
    this.negativeColor = maybeColor(negativeColor);
    this.positiveOpacity = number(positiveOpacity);
    this.negativeOpacity = number(negativeOpacity);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    const {negativeColor, positiveColor, negativeOpacity, positiveOpacity} = this;
    const {height} = dimensions;
    const clipPositive = getClipId();
    const clipNegative = getClipId();
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales, 0, 0)
      .call((g) =>
        g
          .append("clipPath")
          .attr("id", clipPositive)
          .selectAll()
          .data(groupIndex(index, [X1, Y1], this, channels))
          .enter()
          .append("path")
          .attr("d", renderArea(X1, Y1, height, this))
      )
      .call((g) =>
        g
          .append("clipPath")
          .attr("id", clipNegative)
          .selectAll()
          .data(groupIndex(index, [X1, Y1], this, channels))
          .enter()
          .append("path")
          .attr("d", renderArea(X1, Y1, 0, this))
      )
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X2, Y2], this, channels))
          .enter()
          .append("path")
          .attr("fill", positiveColor)
          .attr("fill-opacity", positiveOpacity)
          .attr("stroke", "none")
          .attr("clip-path", `url(#${clipPositive})`)
          .attr("d", renderArea(X2, Y2, 0, this))
      )
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X2, Y2], this, channels))
          .enter()
          .append("path")
          .attr("fill", negativeColor)
          .attr("fill-opacity", negativeOpacity)
          .attr("stroke", "none")
          .attr("clip-path", `url(#${clipNegative})`)
          .attr("d", renderArea(X2, Y2, height, this))
      )
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X1, Y1], this, channels))
          .enter()
          .append("path")
          .attr("d", renderLine(X1, Y1, this))
      )
      .node();
  }
}

function renderArea(X, Y, y0, {curve}) {
  return shapeArea()
    .curve(curve)
    .defined((i) => i >= 0)
    .x((i) => X[i])
    .y1((i) => Y[i])
    .y0(y0);
}

function renderLine(X, Y, {curve}) {
  return shapeLine()
    .curve(curve)
    .defined((i) => i >= 0)
    .x((i) => X[i])
    .y((i) => Y[i]);
}

export function differenceY(data, {x = indexOf, x1 = x, x2 = x, y = identity, y1 = y, y2 = y, ...options} = {}) {
  return new DifferenceY(data, withTip({...options, x1, x2, y1, y2}, "x"));
}
