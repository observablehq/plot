import {first, second} from "../mark.js";
import {AbstractBar} from "./bar.js";

export class Cell extends AbstractBar {
  constructor(data, {x = first, y = second, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", type: "band"},
        {name: "y", value: y, scale: "y", type: "band"}
      ],
      options
    );
  }
  _transform() {
    // noop
  }
  _positions({x: X, y: Y}) {
    return [X, Y];
  }
  _x({x}, {x: X}) {
    const {insetLeft} = this;
    return i => x(X[i]) + insetLeft;
  }
  _y({y}, {y: Y}) {
    const {insetTop} = this;
    return i => y(Y[i]) + insetTop;
  }
  _width({x}) {
    const {insetLeft, insetRight} = this;
    return Math.max(0, x.bandwidth() - insetLeft - insetRight);
  }
  _height({y}) {
    const {insetTop, insetBottom} = this;
    return Math.max(0, y.bandwidth() - insetTop - insetBottom);
  }
}

export function cell(data, options) {
  return new Cell(data, options);
}
