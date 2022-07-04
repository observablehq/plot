import {area as shapeArea} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {first, indexOf, maybeZ, second} from "../options.js";
import {Mark} from "../plot.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles, groupIndex} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "area",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Area extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2, z, curve, tension} = options;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.z = z;
    this.curve = Curve(curve, tension);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    return create("svg:g", context)
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, scales, 0, 0)
        .call(g => g.selectAll()
          .data(groupIndex(index, [X1, Y1, X2, Y2], this, channels))
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, channels)
            .attr("d", shapeArea()
              .curve(this.curve)
              .defined(i => i >= 0)
              .x0(i => X1[i])
              .y0(i => Y1[i])
              .x1(i => X2[i])
              .y1(i => Y2[i])))
      .node();
  }
}

export function area(data, options) {
  if (options === undefined) return areaY(data, {x: first, y: second});
  return new Area(data, options);
}

export function areaX(data, options) {
  const {y = indexOf, ...rest} = maybeDenseIntervalY(options);
  return new Area(data, maybeStackX(maybeIdentityX({...rest, y1: y, y2: undefined})));
}

export function areaY(data, options) {
  const {x = indexOf, ...rest} = maybeDenseIntervalX(options);
  return new Area(data, maybeStackY(maybeIdentityY({...rest, x1: x, x2: undefined})));
}
