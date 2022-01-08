import {create} from "d3";
import {filter} from "../defined.js";
import {Mark} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {maybeSameValue} from "./link.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeMiterlimit: 1,
  strokeWidth: 1.5
};

export class Arrow extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2} = options;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true}
      ],
      options,
      defaults
    );
  }
  render(I, {x, y}, channels) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1, SW} = channels;
    const {dx, dy, strokeWidth} = this;
    const sw = SW ? i => SW[i] : () => strokeWidth;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(filter(I, X1, Y1, X2, Y2))
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => pathArrow(X1[i], Y1[i], X2[i], Y2[i], sw(i)))
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function arrow(data, {x, x1, x2, y, y1, y2, ...options} = {}) {
  ([x1, x2] = maybeSameValue(x, x1, x2));
  ([y1, y2] = maybeSameValue(y, y1, y2));
  return new Arrow(data, {...options, x1, x2, y1, y2});
}

function pathArrow(x1, y1, x2, y2, k) {
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  // The length of the arrowhead’s “wings” (the line segments that extend from
  // the endpoint of the link). This is typically a multiple of the stroke
  // width, but we don’t allow the effective arrowhead length to be too large
  // relative to the length of the arrow. (Unlike Plot.vector, which allows the
  // arrowhead to grow arbitrarily large, but that’s okay since vectors are
  // usually small.)
  const headLength = Math.min(16 * k, length) / 3;

  // The angle between the arrow’s shaft and one of the wings. (The angle
  // between both wings is twice this value.)
  const headAngle = Math.PI / 4;

  // When bending, the offset between the straight line between the two points
  // and the departing tangent from the start point. This must be within ±π/2. A
  // positive angle will produce a clockwise curve, while a negative angle will
  // produce a counterclockwise curve. (Zero will produce a straight line.)
  const bendAngle = Math.PI / 8;

  // The angle of the shaft when it approaches the endpoint, and the angles of
  // the adjacent wings. Here “left” refers to if the arrow is pointing up.
  const endAngle = angle + bendAngle;
  const leftAngle = endAngle + headAngle;
  const rightAngle = endAngle - headAngle;

  // The endpoints of the two wings.
  const x3 = x2 - headLength * Math.cos(leftAngle);
  const y3 = y2 - headLength * Math.sin(leftAngle);
  const x4 = x2 - headLength * Math.cos(rightAngle);
  const y4 = y2 - headLength * Math.sin(rightAngle);

  // The radius of the circle that intersects with the two endpoints and has the
  // specified bend angle.
  const r = Math.hypot(length / Math.tan(bendAngle), length) / 2;

  // If the radius is very large (or even infinite, as when the bend angle is
  // zero), then render a straight line.
  return r < 1e5
    ? `M${x1},${y1}A${r},${r} 0,0,${bendAngle > 0 ? 1 : 0} ${x2},${y2}M${x3},${y3}L${x2},${y2}L${x4},${y4}`
    : `M${x1},${y1}L${x2},${y2}M${x3},${y3}L${x2},${y2}L${x4},${y4}`;
}
