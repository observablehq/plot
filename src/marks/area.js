import {area as shapeArea, line as shapeLine} from "d3";
import {create} from "../context.js";
import {maybeCurve} from "../curve.js";
import {Mark} from "../mark.js";
import {applyGroupedMarkers, markers} from "../marker.js";
import {first, maybeZ, second} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles} from "../style.js";
import {groupIndex, offset} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const noStroke = {stroke: null, strokeWidth: null, strokeOpacity: null, strokeLinejoin: null, strokeLinecap: null, strokeMiterlimit: null, strokeDasharray: null, strokeDashoffset: null}; // prettier-ignore
const noFill = {fill: null, fillOpacity: null};

const defaults = {
  ariaLabel: "area",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Area extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2, z, curve, tension, line} = options;
    super(
      data,
      {
        x1: {value: x1, scale: "x"},
        y1: {value: y1, scale: "y"},
        x2: {value: x2, scale: "x", optional: true},
        y2: {value: y2, scale: "y", optional: true},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      line ? {...defaults, stroke: "currentColor", strokeWidth: 1.5, fillOpacity: 0.3} : defaults
    );
    this.z = z;
    this.curve = maybeCurve(curve, tension);
    this.line = !!line;
    if (this.line) markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    const areaShape = shapeArea()
      .curve(this.curve)
      .defined((i) => i >= 0)
      .x0((i) => X1[i])
      .y0((i) => Y1[i])
      .x1((i) => X2[i])
      .y1((i) => Y2[i]);
    return create("svg:g", context)
      .call(this.line ? () => {} : applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales, 0, 0)
      .call((g) => {
        const enter = g
          .selectAll()
          .data(groupIndex(index, [X1, Y1, X2, Y2], this, channels))
          .enter();
        if (this.line) {
          const group = enter.append("g");
          group
            .append("path")
            .call(applyDirectStyles, this)
            .call(applyIndirectStyles, {...this, ...noStroke}, dimensions, context)
            .call(applyGroupedChannelStyles, this, {...channels, ...noStroke})
            .attr("d", areaShape);
          group
            .append("path")
            .call(applyDirectStyles, this)
            .attr("fill", "none")
            .call(applyIndirectStyles, {...this, ...noFill}, dimensions, context)
            .call(applyGroupedChannelStyles, this, {...channels, ...noFill})
            .call(applyGroupedMarkers, this, channels, context)
            .attr("transform", offset ? `translate(${offset},${offset})` : null)
            .attr(
              "d",
              shapeLine()
                .curve(this.curve)
                .defined((i) => i >= 0)
                .x((i) => X2[i])
                .y((i) => Y2[i])
            );
        } else {
          enter
            .append("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, channels)
            .attr("d", areaShape);
        }
      })
      .node();
  }
}

export function area(data, options) {
  if (options === undefined) return areaY(data, {x: first, y: second});
  return new Area(data, options);
}

export function areaX(data, options) {
  const {x, y, fill, z = x === fill ? null : undefined, ...rest} = maybeDenseIntervalY(options);
  return new Area(data, maybeStackX({...rest, x, y1: y, y2: undefined, z, fill}));
}

export function areaY(data, options) {
  const {x, y, fill, z = y === fill ? null : undefined, ...rest} = maybeDenseIntervalX(options);
  return new Area(data, maybeStackY({...rest, x1: x, x2: undefined, y, z, fill}));
}
