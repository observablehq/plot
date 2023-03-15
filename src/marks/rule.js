import {geoPath, range} from "d3";
import {create} from "../context.js";
import {Mark} from "../mark.js";
import {coerceNumbers} from "../options.js";
import {identity, number} from "../options.js";
import {isCollapsed} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles, offset} from "../style.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "rule",
  fill: null,
  stroke: "currentColor"
};

export class RuleX extends Mark {
  constructor(data, options = {}) {
    const {x, y1, y2, inset = 0, insetTop = inset, insetBottom = inset, projected = true} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y1: {value: y1, scale: "y", optional: true},
        y2: {value: y2, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
    this.projected = !!projected;
  }
  project(channels, values, context) {
    // If projected, projection is handled at render.
    if (!this.projected) {
      super.project(channels, values, context);
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y1: Y1, y2: Y2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetTop, insetBottom, projected} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions)
      .call(applyTransform, this, {x: X && x}, offset, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .call(
            projected && context.projection
              ? (g) =>
                  g
                    .append("path")
                    .attr("fill", "none")
                    .attr("d", sphereRuleX(context.projection, X, Y1, Y2))
                    .call(applyRuleStyles, this, channels)
              : (g) =>
                  g
                    .append("line")
                    .attr("x1", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2)
                    .attr("x2", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2)
                    .attr("y1", Y1 && !isCollapsed(y) ? (i) => Y1[i] + insetTop : marginTop + insetTop)
                    .attr(
                      "y2",
                      Y2 && !isCollapsed(y)
                        ? y.bandwidth
                          ? (i) => Y2[i] + y.bandwidth() - insetBottom
                          : (i) => Y2[i] - insetBottom
                        : height - marginBottom - insetBottom
                    )
                    .call(applyRuleStyles, this, channels)
          )
      )
      .node();
  }
}

export class RuleY extends Mark {
  constructor(data, options = {}) {
    const {x1, x2, y, inset = 0, insetRight = inset, insetLeft = inset, projected = true} = options;
    super(
      data,
      {
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1, scale: "x", optional: true},
        x2: {value: x2, scale: "x", optional: true}
      },
      options,
      defaults
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
    this.projected = !!projected;
  }
  project(channels, values, context) {
    // If projected, projection is handled at render.
    if (!this.projected) {
      super.project(channels, values, context);
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {y: Y, x1: X1, x2: X2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetLeft, insetRight, projected} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {y: Y && y}, 0, offset)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .call(
            projected && context.projection
              ? (g) =>
                  g
                    .append("path")
                    .attr("fill", "none")
                    .attr("d", sphereRuleY(context.projection, Y, X1, X2))
                    .call(applyRuleStyles, this, channels)
              : (g) =>
                  g
                    .append("line")
                    .attr("x1", X1 && !isCollapsed(x) ? (i) => X1[i] + insetLeft : marginLeft + insetLeft)
                    .attr(
                      "x2",
                      X2 && !isCollapsed(x)
                        ? x.bandwidth
                          ? (i) => X2[i] + x.bandwidth() - insetRight
                          : (i) => X2[i] - insetRight
                        : width - marginRight - insetRight
                    )
                    .attr("y1", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2)
                    .attr("y2", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2)
                    .call(applyRuleStyles, this, channels)
          )
      )
      .node();
  }
}

function applyRuleStyles(selection, mark, channels) {
  applyDirectStyles(selection, mark);
  applyChannelStyles(selection, mark, channels);
}

// TODO Y1, Y2; configurable precision?
function sphereRuleX(projection, X) {
  const path = geoPath(projection);
  X = coerceNumbers(X);
  return (i) =>
    path({
      type: "LineString",
      coordinates: [
        [X[i], -90],
        [X[i], 0],
        [X[i], 90]
      ]
    });
}

// TODO X1, X2; configurable precision
function sphereRuleY(projection, Y) {
  const path = geoPath(projection);
  Y = coerceNumbers(Y);
  return (i) =>
    path({
      type: "LineString",
      coordinates: range(-180, 181, 3).map((x) => [x, Y[i]])
    });
}

export function ruleX(data, options) {
  let {x = identity, y, y1, y2, ...rest} = maybeIntervalY(options);
  [y1, y2] = maybeOptionalZero(y, y1, y2);
  return new RuleX(data, {...rest, x, y1, y2});
}

export function ruleY(data, options) {
  let {y = identity, x, x1, x2, ...rest} = maybeIntervalX(options);
  [x1, x2] = maybeOptionalZero(x, x1, x2);
  return new RuleY(data, {...rest, y, x1, x2});
}

// For marks specified either as [0, x] or [x1, x2], or nothing.
function maybeOptionalZero(x, x1, x2) {
  if (x === undefined) {
    if (x1 === undefined) {
      if (x2 !== undefined) return [0, x2];
    } else {
      if (x2 === undefined) return [0, x1];
    }
  } else if (x1 === undefined) {
    return x2 === undefined ? [0, x] : [x, x2];
  } else if (x2 === undefined) {
    return [x, x1];
  }
  return [x1, x2];
}
