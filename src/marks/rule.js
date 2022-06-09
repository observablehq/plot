import {create} from "d3";
import {identity, number} from "../options.js";
import {Mark} from "../plot.js";
import {bandwidth, isCollapsed} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles, offset} from "../style.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "rule",
  fill: null,
  stroke: "currentColor"
};

export class RuleX extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y1,
      y2,
      inset = 0,
      insetTop = inset,
      insetBottom = inset
    } = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y1: Y1, y2: Y2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetTop, insetBottom, dx, dy} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, X && x, null, offset + dx, dy)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append("line")
            .call(applyDirectStyles, this)
            .attr("x1", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("x2", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("y1", Y1 && !isCollapsed(y) ? i => Y1[i] + insetTop : marginTop + insetTop)
            .attr("y2", Y2 && !isCollapsed(y) ? i => Y2[i] + bandwidth(y) - insetBottom : height - marginBottom - insetBottom)
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export class RuleY extends Mark {
  constructor(data, options = {}) {
    const {
      x1,
      x2,
      y,
      inset = 0,
      insetRight = inset,
      insetLeft = inset
    } = options;
    super(
      data,
      [
        {name: "y", value: y, scale: "y", optional: true},
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true}
      ],
      options,
      defaults
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  render(index, {x, y}, channels, dimensions) {
    const {y: Y, x1: X1, x2: X2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetLeft, insetRight, dx, dy} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, null, Y && y, dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append("line")
            .call(applyDirectStyles, this)
            .attr("x1", X1 && !isCollapsed(x) ? i => X1[i] + insetLeft : marginLeft + insetLeft)
            .attr("x2", X2 && !isCollapsed(x) ? i => X2[i] + bandwidth(x) - insetRight : width - marginRight - insetRight)
            .attr("y1", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .attr("y2", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function ruleX(data, options) {
  let {x = identity, y, y1, y2, ...rest} = maybeIntervalY(options);
  ([y1, y2] = maybeOptionalZero(y, y1, y2));
  return new RuleX(data, {...rest, x, y1, y2});
}

export function ruleY(data, options) {
  let {y = identity, x, x1, x2, ...rest} = maybeIntervalX(options);
  ([x1, x2] = maybeOptionalZero(x, x1, x2));
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
