import {maybeZero} from "../mark.js";
import {AbstractBarX, AbstractBarY} from "./bar.js";

export class SpanX extends AbstractBarX {
  constructor(data, {x1, x2, ...options} = {}) {
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "x2", value: x2, scale: "x"}
      ],
      options
    );
  }
  _positions({x1: X1, x2: X2}) {
    return [X1, X2];
  }
  _y(scales, channels, {marginTop}) {
    const {insetTop} = this;
    return marginTop + insetTop;
  }
  _height(scales, channels, {marginTop, marginBottom, height}) {
    const {insetTop, insetBottom} = this;
    const bandwidth = height - marginTop - marginBottom;
    return Math.max(0, bandwidth - insetTop - insetBottom);
  }
}

export class SpanY extends AbstractBarY {
  constructor(data, {y1, y2, ...options} = {}) {
    super(
      data,
      [
        {name: "y1", value: y1, scale: "y"},
        {name: "y2", value: y2, scale: "y"}
      ],
      options
    );
  }
  _positions({y1: Y1, y2: Y2}) {
    return [Y1, Y2];
  }
  _x(scales, channels, {marginLeft}) {
    const {insetLeft} = this;
    return marginLeft + insetLeft;
  }
  _width(scales, channels, {marginRight, marginLeft, width}) {
    const {insetLeft, insetRight} = this;
    const bandwidth = width - marginRight - marginLeft;
    return Math.max(0, bandwidth - insetLeft - insetRight);
  }
}

export function spanX(data, {x, x1, x2, ...options} = {}) {
  ([x1, x2] = maybeZero(x, x1, x2));
  return new SpanX(data, {...options, x1, x2});
}

export function spanY(data, {y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeZero(y, y1, y2));
  return new SpanY(data, {...options, y1, y2});
}
