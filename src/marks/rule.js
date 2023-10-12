import {create} from "../context.js";
import {Mark, withTip} from "../mark.js";
import {applyMarkers, markers} from "../marker.js";
import {identity, number} from "../options.js";
import {isCollapsed} from "../scales.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {template} from "../template.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "rule",
  fill: null,
  stroke: "currentColor"
};

export class RuleX extends Mark {
  constructor(data, options = {}) {
    const {x, y1, y2, tick = 0, inset = 0, insetTop = inset, insetBottom = inset} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y1: {value: y1, scale: "y", optional: true},
        y2: {value: y2, scale: "y", optional: true}
      },
      withTip(options, "x"),
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
    this.tick = number(tick === true ? 3 : tick);
    markers(this, options);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y1: Y1, y2: Y2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {tick, insetTop, insetBottom} = this;
    const t = tick ? `m${tick},0h${-tick * 2}m${tick},0` : "";
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x}, offset, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr(
            "d",
            template`M${X ? (i) => X[i] : (marginLeft + width - marginRight) / 2},${
              Y1 && !isCollapsed(y) ? (i) => Y1[i] + insetTop : marginTop + insetTop
            }${t}V${
              Y2 && !isCollapsed(y)
                ? y.bandwidth
                  ? (i) => Y2[i] + y.bandwidth() - insetBottom
                  : (i) => Y2[i] - insetBottom
                : height - marginBottom - insetBottom
            }${tick ? `m${tick},0h${-tick * 2}m${tick},0` : ""}${t}`
          )
          .call(applyChannelStyles, this, channels)
          .call(applyMarkers, this, channels, context)
      )
      .node();
  }
}

export class RuleY extends Mark {
  constructor(data, options = {}) {
    const {x1, x2, y, tick = 0, inset = 0, insetRight = inset, insetLeft = inset} = options;
    super(
      data,
      {
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1, scale: "x", optional: true},
        x2: {value: x2, scale: "x", optional: true}
      },
      withTip(options, "y"),
      defaults
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
    this.tick = number(tick === true ? 3 : tick);
    markers(this, options);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {y: Y, x1: X1, x2: X2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {tick, insetLeft, insetRight} = this;
    const t = tick ? `m0,${tick}v${-tick * 2}m0,${tick}` : "";
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {y: Y && y}, 0, offset)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr(
            "d",
            template`M${X1 && !isCollapsed(x) ? (i) => X1[i] + insetLeft : marginLeft + insetLeft},${
              Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2
            }${t}H${
              X2 && !isCollapsed(x)
                ? x.bandwidth
                  ? (i) => X2[i] + x.bandwidth() - insetRight
                  : (i) => X2[i] - insetRight
                : width - marginRight - insetRight
            }${t}`
          )
          .call(applyChannelStyles, this, channels)
          .call(applyMarkers, this, channels, context)
      )
      .node();
  }
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
  if (x == null) {
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
