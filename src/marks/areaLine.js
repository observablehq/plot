import {area as shapeArea, line as shapeLine} from "d3";
import {Area} from "./area.js";
import {create} from "../context.js";
import {applyGroupedMarkers, markers} from "../marker.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyGroupedChannelStyles} from "../style.js";
import {groupIndex} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "area-line",
  fillOpacity: 0.1,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class AreaLine extends Area {
  constructor(data, options = {}) {
    super(data, options, defaults);
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

export function areaLineX(data, options) {
  const {x, y, fill, z = x === fill ? null : undefined, ...rest} = maybeDenseIntervalY(options);
  return new AreaLine(data, maybeStackX({...rest, x, y1: y, y2: undefined, z, fill}));
}

export function areaLineY(data, options) {
  const {x, y, fill, z = y === fill ? null : undefined, ...rest} = maybeDenseIntervalX(options);
  return new AreaLine(data, maybeStackY({...rest, x1: x, x2: undefined, y, z, fill}));
}
