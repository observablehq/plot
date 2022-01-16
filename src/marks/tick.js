import {create} from "d3";
import {Mark} from "../plot.js";
import {identity, number} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles, offset} from "../style.js";

const defaults = {
  fill: null,
  stroke: "currentColor"
};

class AbstractTick extends Mark {
  constructor(data, channels, options) {
    super(data, channels, options, defaults);
  }
  render(index, scales, channels, dimensions) {
    const {dx, dy} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(this._transform, scales, dx, dy)
        .call(g => g.selectAll("line")
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", this._x1(scales, channels, dimensions))
            .attr("x2", this._x2(scales, channels, dimensions))
            .attr("y1", this._y1(scales, channels, dimensions))
            .attr("y2", this._y2(scales, channels, dimensions))
            .call(applyChannelStyles, this, channels))
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
  _transform(selection, {x}, dx, dy) {
    selection.call(applyTransform, x, null, offset + dx, dy);
  }
  _x1(scales, {x: X}) {
    return i => X[i];
  }
  _x2(scales, {x: X}) {
    return i => X[i];
  }
  _y1(scales, {y: Y}, {marginTop}) {
    const {insetTop} = this;
    return Y ? i => Y[i] + insetTop : marginTop + insetTop;
  }
  _y2({y}, {y: Y}, {height, marginBottom}) {
    const {insetBottom} = this;
    return Y ? i => Y[i] + y.bandwidth() - insetBottom : height - marginBottom - insetBottom;
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
  _transform(selection, {y}, dx, dy) {
    selection.call(applyTransform, null, y, dx, offset + dy);
  }
  _x1(scales, {x: X}, {marginLeft}) {
    const {insetLeft} = this;
    return X ? i => X[i] + insetLeft : marginLeft + insetLeft;
  }
  _x2({x}, {x: X}, {width, marginRight}) {
    const {insetRight} = this;
    return X ? i => X[i] + x.bandwidth() - insetRight : width - marginRight - insetRight;
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
