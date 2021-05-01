import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, maybeColor, title, number} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr} from "../style.js";

export class RuleX extends Mark {
  constructor(
    data,
    {
      x,
      y1,
      y2,
      title,
      stroke,
      inset = 0,
      insetTop = inset,
      insetBottom = inset,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    Style(this, {stroke: cstroke, ...options});
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  render(
    I,
    {x, y},
    {x: X, y1: Y1, y2: Y2, title: L, stroke: S},
    {width, height, marginTop, marginRight, marginLeft, marginBottom}
  ) {
    const index = filter(I, X, Y1, Y2, S);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, X && x, null, 0.5, 0)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("x2", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("y1", Y1 ? i => Y1[i] + this.insetTop : marginTop)
            .attr("y2", Y2 ? (y.bandwidth ? i => Y2[i] + y.bandwidth() - this.insetBottom : i => Y2[i] - this.insetBottom) : height - marginBottom)
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(title(L)))
      .node();
  }
}

export class RuleY extends Mark {
  constructor(
    data,
    {
      x1,
      x2,
      y,
      title,
      stroke,
      inset = 0,
      insetRight = inset,
      insetLeft = inset,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    super(
      data,
      [
        {name: "y", value: y, scale: "y", optional: true},
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    Style(this, {stroke: cstroke, ...options});
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {x, y},
    {y: Y, x1: X1, x2: X2, title: L, stroke: S},
    {width, height, marginTop, marginRight, marginLeft, marginBottom}
  ) {
    const index = filter(I, Y, X1, X2);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, null, Y && y, 0, 0.5)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", X1 ? i => X1[i] + this.insetLeft : marginLeft)
            .attr("x2", X2 ? (x.bandwidth ? i => X2[i] + x.bandwidth() - this.insetRight : i => X2[i] - this.insetRight) : width - marginRight)
            .attr("y1", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .attr("y2", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(title(L)))
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
