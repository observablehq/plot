import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, number} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles} from "../style.js";

const defaults = {
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
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginLeft, marginBottom}
  ) {
    const {x: X, y1: Y1, y2: Y2, stroke: S, strokeOpacity: SO} = channels;
    const index = filter(I, X, Y1, Y2, S, SO); // TODO filter standard channels
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, X && x, null, 0.5, 0)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("x2", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("y1", Y1 ? i => Y1[i] + this.insetTop : marginTop + this.insetTop)
            .attr("y2", Y2 ? (y.bandwidth ? i => Y2[i] + y.bandwidth() - this.insetBottom : i => Y2[i] - this.insetBottom) : height - marginBottom - this.insetBottom)
            .call(applyChannelStyles, channels))
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
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginLeft, marginBottom}
  ) {
    const {y: Y, x1: X1, x2: X2, stroke: S, strokeOpacity: SO} = channels;
    const index = filter(I, Y, X1, X2, S, SO); // TODO filter standard channels
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, null, Y && y, 0, 0.5)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X1 ? i => X1[i] + this.insetLeft : marginLeft + this.insetLeft)
            .attr("x2", X2 ? (x.bandwidth ? i => X2[i] + x.bandwidth() - this.insetRight : i => X2[i] - this.insetRight) : width - marginRight - this.insetRight)
            .attr("y1", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .attr("y2", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .call(applyChannelStyles, channels))
      .node();
  }
}

export function ruleX(data, {x = identity, y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeOptionalZero(y, y1, y2));
  return new RuleX(data, {...options, x, y1, y2});
}

export function ruleY(data, {y = identity, x, x1, x2, ...options} = {}) {
  ([x1, x2] = maybeOptionalZero(x, x1, x2));
  return new RuleY(data, {...options, y, x1, x2});
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
