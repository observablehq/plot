import {max, area as shapeArea, line as shapeLine} from "d3";
import {create} from "../context.js";
import {maybeCurve} from "../curve.js";
import {Mark} from "../mark.js";
import {applyGroupedMarkers, markers} from "../marker.js";
import {first, identity, indexOf, map, maybeZ, second, valueof} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles} from "../style.js";
import {groupIndex, offset} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const areaDefaults = {
  ariaLabel: "area",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

const areaLineDefaults = {
  ariaLabel: "area-line",
  fillOpacity: 0.3,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Area extends Mark {
  constructor(data, options = {}, defaults = areaDefaults) {
    const {x1, y1, x2, y2, z, curve, tension} = options;
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
      defaults
    );
    this.z = z;
    this.curve = maybeCurve(curve, tension);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X1, Y1, X2, Y2], this, channels))
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .attr(
            "d",
            shapeArea()
              .curve(this.curve)
              .defined((i) => i >= 0)
              .x0((i) => X1[i])
              .y0((i) => Y1[i])
              .x1((i) => X2[i])
              .y1((i) => Y2[i])
          )
      )
      .node();
  }
}

class AreaLine extends Area {
  constructor(data, options = {}) {
    super(data, options, areaLineDefaults);
    markers(this, options);
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X1, Y1, X2, Y2], this, channels))
          .enter()
          .append("g")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .call((e) =>
            e
              .append("path")
              .attr("stroke", "none")
              .attr(
                "d",
                shapeArea()
                  .curve(this.curve)
                  .defined((i) => i >= 0)
                  .x0((i) => X1[i])
                  .y0((i) => Y1[i])
                  .x1((i) => X2[i])
                  .y1((i) => Y2[i])
              )
          )
          .call((e) =>
            e
              .append("path")
              .call(applyGroupedMarkers, this, channels, context)
              .attr("fill", "none")
              .attr("transform", offset ? `translate(${offset},${offset})` : null)
              .attr(
                "d",
                shapeLine()
                  .curve(this.curve)
                  .defined((i) => i >= 0)
                  .x((i) => X2[i])
                  .y((i) => Y2[i])
              )
          )
      )
      .node();
  }
}

export function area(data, options) {
  if (options === undefined) return areaY(data, {x: first, y: second});
  return new Area(data, options);
}

export function areaX(data, options) {
  const {x, y, line, color, stroke = color, fill = color, z = x === fill || x === stroke ? null : undefined, ...rest} = maybeDenseIntervalY(options); // prettier-ignore
  return new (line ? AreaLine : Area)(data, maybeStackX({...rest, x, y1: y, y2: undefined, z, stroke, fill}));
}

export function areaY(data, options) {
  const {x, y, line, color, stroke = color, fill = color, z = y === fill || y === stroke ? null : undefined, ...rest} = maybeDenseIntervalX(options); // prettier-ignore
  return new (line ? AreaLine : Area)(data, maybeStackY({...rest, x1: x, x2: undefined, y, z, stroke, fill}));
}

export function horizonY(data, {bands = 7, x = indexOf, y = identity, ...options} = {}) {
  let Y, step;
  return Array.from({length: bands}, (_, i) =>
    areaY(data, {
      x,
      y: {
        transform(data) {
          if (Y === undefined) (Y = valueof(data, y)), (step = max(Y) / bands);
          return map(Y, (y) => y - i * step);
        },
        hint: {
          min: 0,
          max: {
            valueOf() {
              return step;
            }
          }
        }
      },
      fill: i,
      clip: true,
      ...options // TODO ignore fill, clip
    })
  );
}
