import {create} from "../context.js";
import {identity, number} from "../options.js";
import {Mark} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles, offset} from "../style.js";

const defaults = {
  ariaLabel: "tick",
  fill: null,
  stroke: "currentColor"
};

class AbstractTick extends Mark {
  constructor(data, channels, options) {
    super(data, channels, options, defaults);
  }
  render(index, scales, channels, dimensions, context) {
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(this._transform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("line")
          .call(applyDirectStyles, this)
          .attr("x1", this._x1(scales, channels, dimensions))
          .attr("x2", this._x2(scales, channels, dimensions))
          .attr("y1", this._y1(scales, channels, dimensions))
          .attr("y2", this._y2(scales, channels, dimensions))
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

export class TickX extends AbstractTick {
  constructor(data, options = {}) {
    const {x, y, inset = 0, insetTop = inset, insetBottom = inset} = options;
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y", type: "band", optional: true}
      },
      options
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  _transform(selection, mark, {x}) {
    selection.call(applyTransform, mark, {x}, offset, 0);
  }
  _x1(scales, {x: X}) {
    return (i) => X[i];
  }
  _x2(scales, {x: X}) {
    return (i) => X[i];
  }
  _y1({y}, {y: Y}, {marginTop}) {
    const {insetTop} = this;
    return Y && y ? (i) => Y[i] + insetTop : marginTop + insetTop;
  }
  _y2({y}, {y: Y}, {height, marginBottom}) {
    const {insetBottom} = this;
    return Y && y ? (i) => Y[i] + y.bandwidth() - insetBottom : height - marginBottom - insetBottom;
  }
}

export class TickY extends AbstractTick {
  constructor(data, options = {}) {
    const {x, y, inset = 0, insetRight = inset, insetLeft = inset} = options;
    super(
      data,
      {
        y: {value: y, scale: "y"},
        x: {value: x, scale: "x", type: "band", optional: true}
      },
      options
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  _transform(selection, mark, {y}) {
    selection.call(applyTransform, mark, {y}, 0, offset);
  }
  _x1({x}, {x: X}, {marginLeft}) {
    const {insetLeft} = this;
    return X && x ? (i) => X[i] + insetLeft : marginLeft + insetLeft;
  }
  _x2({x}, {x: X}, {width, marginRight}) {
    const {insetRight} = this;
    return X && x ? (i) => X[i] + x.bandwidth() - insetRight : width - marginRight - insetRight;
  }
  _y1(scales, {y: Y}) {
    return (i) => Y[i];
  }
  _y2(scales, {y: Y}) {
    return (i) => Y[i];
  }
}

/** @jsdoc tickX */
export function tickX(data, options = {}) {
  const {x = identity, ...remainingOptions} = options;
  return new TickX(data, {...remainingOptions, x});
}

/** @jsdoc tickY */
export function tickY(data, options = {}) {
  const {y = identity, ...remainingOptions} = options;
  return new TickY(data, {...remainingOptions, y});
}
