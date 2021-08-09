import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, number} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles} from "../style.js";

const defaults = {
  fill: null,
  stroke: "currentColor"
};

class AbstractTick extends Mark {
  constructor(data, channels, options) {
    super(data, channels, options, defaults);
  }
  render(I, scales, channels, dimensions) {
    const {x: X, y: Y} = channels;
    const index = filter(I, X, Y);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(this._transform, scales)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", this._x1(scales, channels, dimensions))
            .attr("x2", this._x2(scales, channels, dimensions))
            .attr("y1", this._y1(scales, channels, dimensions))
            .attr("y2", this._y2(scales, channels, dimensions))
            .call(applyChannelStyles, channels))
      .node();
  }
}

export class TickX extends AbstractTick {
  constructor(data, options = {}) {
    const {
      x,
      y,
      inset = 0,
      insetTop = inset,
      insetBottom = inset
    } = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band", optional: true}
      ],
      options
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  _transform(selection, {x}) {
    selection.call(applyTransform, x, null, 0.5, 0);
  }
  _x1(scales, {x: X}) {
    return i => X[i];
  }
  _x2(scales, {x: X}) {
    return i => X[i];
  }
  _y1(scales, {y: Y}, {marginTop}) {
    return Y ? i => Y[i] + this.insetTop : marginTop + this.insetTop;
  }
  _y2({y}, {y: Y}, {height, marginBottom}) {
    return Y ? i => Y[i] + y.bandwidth() - this.insetBottom : height - marginBottom - this.insetBottom;
  }
}

export class TickY extends AbstractTick {
  constructor(data, options = {}) {
    const {
      x,
      y,
      inset = 0,
      insetRight = inset,
      insetLeft = inset
    } = options;
    super(
      data,
      [
        {name: "y", value: y, scale: "y"},
        {name: "x", value: x, scale: "x", type: "band", optional: true}
      ],
      options
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  _transform(selection, {y}) {
    selection.call(applyTransform, null, y, 0, 0.5);
  }
  _x1(scales, {x: X}, {marginLeft}) {
    return X ? i => X[i] + this.insetLeft : marginLeft + this.insetLeft;
  }
  _x2({x}, {x: X}, {width, marginRight}) {
    return X ? i => X[i] + x.bandwidth() - this.insetRight : width - marginRight - this.insetRight;
  }
  _y1(scales, {y: Y}) {
    return i => Y[i];
  }
  _y2(scales, {y: Y}) {
    return i => Y[i];
  }
}

export function tickX(data, {x = identity, ...options} = {}) {
  return new TickX(data, {...options, x});
}

export function tickY(data, {y = identity, ...options} = {}) {
  return new TickY(data, {...options, y});
}
