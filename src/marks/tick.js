import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, maybeColor, title, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr} from "../style.js";

class AbstractTick extends Mark {
  constructor(
    data,
    channels,
    {
      title,
      stroke,
      strokeOpacity,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
    super(
      data,
      [
        ...channels,
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
      ],
      options
    );
    Style(this, {stroke: cstroke, strokeOpacity: cstrokeOpacity, ...options});
  }
  render(I, scales, channels, dimensions) {
    const {x: X, y: Y, title: L, stroke: S, strokeOpacity: SO} = channels;
    const index = filter(I, X, Y, S, SO);
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
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(applyAttr, "stroke-opacity", SO && (i => SO[i]))
            .call(title(L)))
      .node();
  }
}

export class TickX extends AbstractTick {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band", optional: true}
      ],
      options
    );
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
    return Y ? i => Y[i] : marginTop;
  }
  _y2({y}, {y: Y}, {height, marginBottom}) {
    return Y ? i => Y[i] + y.bandwidth() : height - marginBottom;
  }
}

export class TickY extends AbstractTick {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      [
        {name: "y", value: y, scale: "y"},
        {name: "x", value: x, scale: "x", type: "band", optional: true}
      ],
      options
    );
  }
  _transform(selection, {y}) {
    selection.call(applyTransform, null, y, 0, 0.5);
  }
  _x1(scales, {x: X}, {marginLeft}) {
    return X ? i => X[i] : marginLeft;
  }
  _x2({x}, {x: X}, {width, marginRight}) {
    return X ? i => X[i] + x.bandwidth() : width - marginRight;
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
