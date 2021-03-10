import {ascending} from "d3";
import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, identity, maybeColor, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

class AbstractTick extends Mark {
  constructor(
    data,
    channels,
    {
      z,
      title,
      stroke,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    super(
      data,
      [
        ...channels,
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      options
    );
    Style(this, {stroke: cstroke, ...options});
  }
  render(I, scales, channels, dimensions) {
    const {color} = scales;
    const {x: X, y: Y, z: Z, title: L, stroke: S} = channels;
    const index = filter(I, X, Y, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
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
            .attr("stroke", S && (i => color(S[i])))
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
    selection.call(applyTransform, x, false, 0.5, 0);
  }
  _x1({x}, {x: X}) {
    return i => Math.round(x(X[i]));
  }
  _x2({x}, {x: X}) {
    return i => Math.round(x(X[i]));
  }
  _y1({y}, {y: Y}, {marginTop}) {
    return Y ? i => y(Y[i]) : marginTop;
  }
  _y2({y}, {y: Y}, {height, marginBottom}) {
    return Y ? i => y(Y[i]) + y.bandwidth() : height - marginBottom;
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
    selection.call(applyTransform, false, y, 0, 0.5);
  }
  _x1({x}, {x: X}, {marginLeft}) {
    return X ? i => x(X[i]) : marginLeft;
  }
  _x2({x}, {x: X}, {width, marginRight}) {
    return X ? i => x(X[i]) + x.bandwidth() : width - marginRight;
  }
  _y1({y}, {y: Y}) {
    return i => Math.round(y(Y[i]));
  }
  _y2({y}, {y: Y}) {
    return i => Math.round(y(Y[i]));
  }
}

export function tickX(data, {x = identity, ...options} = {}) {
  return new TickX(data, {...options, x});
}

export function tickY(data, {y = identity, ...options} = {}) {
  return new TickY(data, {...options, y});
}
