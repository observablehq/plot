import {create} from "d3";
import {radians} from "../math.js";
import {Mark} from "../plot.js";
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
    const {
      x1,
      y1,
      x2,
      y2,
      bend = 0,
      headAngle = 60,
      headLength = 8,
      inset = 0,
      insetStart = inset,
      insetEnd = inset
    } = options;
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
    this.bend = bend === true ? 22.5 : Math.max(-90, Math.min(90, bend));
    this.headAngle = +headAngle;
    this.headLength = +headLength;
    this.insetStart = +insetStart;
    this.insetEnd = +insetEnd;
  }
  render(index, {x, y}, channels) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1, SW} = channels;
    const {dx, dy, strokeWidth, bend, headAngle, headLength, insetStart, insetEnd} = this;
    const sw = SW ? i => SW[i] : () => strokeWidth;

    // When bending, the offset between the straight line between the two points
    // and the outgoing tangent from the start point. (Also the negative
    // incoming tangent to the end point.) This must be within ±π/2. A positive
    // angle will produce a clockwise curve; a negative angle will produce a
    // counterclockwise curve; zero will produce a straight line.
    const bendAngle = bend * radians;

    // The angle between the arrow’s shaft and one of the wings; the “head”
    // angle between the wings is twice this value.
    const wingAngle = headAngle * radians / 2;

    // The length of the arrowhead’s “wings” (the line segments that extend from
    // the end point) relative to the stroke width.
    const wingScale = headLength / 1.5;

    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => {
              let x1 = X1[i], y1 = Y1[i], x2 = X2[i], y2 = Y2[i];
              let lineAngle = Math.atan2(y2 - y1, x2 - x1);
              const lineLength = Math.hypot(x2 - x1, y2 - y1);

              // We don’t allow the wing length to be too large relative to the
              // length of the arrow. (Plot.vector allows arbitrarily large
              // wings, but that’s okay since vectors are usually small.)
              const headLength = Math.min(wingScale * sw(i), lineLength / 3);

              // The radius of the circle that intersects with the two endpoints
              // and has the specified bend angle.
              const r = Math.hypot(lineLength / Math.tan(bendAngle), lineLength) / 2;

              // Apply insets.
              if (insetStart || insetEnd) {
                if (r < 1e5) {
                  // For inset swoopy arrows, compute the circle-circle
                  // intersection between a circle centered around the
                  // respective arrow endpoint and the center of the circle
                  // segment that forms the shaft of the arrow.
                  const sign = Math.sign(bendAngle);
                  const [cx, cy] = pointPointCenter([x1, y1], [x2, y2], r, sign);
                  if (insetStart) {
                    ([x1, y1] = circleCircleIntersect([cx, cy, r], [x1, y1, insetStart], -sign * Math.sign(insetStart)));
                  }
                  // For the end inset, rotate the arrowhead so that it aligns
                  // with the truncated end of the arrow. Since the arrow is a
                  // segment of the circle centered at <cx,cy>, we can compute
                  // the angular difference to the new endpoint.
                  if (insetEnd) {
                    const [x, y] = circleCircleIntersect([cx, cy, r], [x2, y2, insetEnd], sign * Math.sign(insetEnd));
                    lineAngle += Math.atan2(y - cy, x - cx) - Math.atan2(y2 - cy, x2 - cx);
                    x2 = x, y2 = y;
                  }
                } else {
                  // For inset straight arrows, offset along the straight line.
                  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
                  if (insetStart) x1 += dx / d * insetStart, y1 += dy / d * insetStart;
                  if (insetEnd) x2 -= dx / d * insetEnd, y2 -= dy / d * insetEnd;
                }
              }

              // The angle of the arrow as it approaches the endpoint, and the
              // angles of the adjacent wings. Here “left” refers to if the
              // arrow is pointing up.
              const endAngle = lineAngle + bendAngle;
              const leftAngle = endAngle + wingAngle;
              const rightAngle = endAngle - wingAngle;

              // The endpoints of the two wings.
              const x3 = x2 - headLength * Math.cos(leftAngle);
              const y3 = y2 - headLength * Math.sin(leftAngle);
              const x4 = x2 - headLength * Math.cos(rightAngle);
              const y4 = y2 - headLength * Math.sin(rightAngle);

              // If the radius is very large (or even infinite, as when the bend
              // angle is zero), then render a straight line.
              return `M${x1},${y1}${r < 1e5 ? `A${r},${r} 0,0,${bendAngle > 0 ? 1 : 0} ` : `L`}${x2},${y2}M${x3},${y3}L${x2},${y2}L${x4},${y4}`;
            })
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

function pointPointCenter([ax, ay], [bx, by], r, sign = 1) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
  const k = sign * Math.sqrt(r * r - d * d / 4) / d;
  return [(ax + bx) / 2 - dy * k, (ay + by) / 2 + dx * k];
}

function circleCircleIntersect([ax, ay, ar], [bx, by, br], sign = 1) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
  const x = (dx * dx + dy * dy - br * br + ar * ar) / (2 * d);
  const y = sign * Math.sign(ay) * Math.sqrt(ar * ar - x * x);
  return [ax + (dx * x + dy * y) / d, ay + (dy * x - dx * y) / d];
}

export function arrow(data, {x, x1, x2, y, y1, y2, ...options} = {}) {
  ([x1, x2] = maybeSameValue(x, x1, x2));
  ([y1, y2] = maybeSameValue(y, y1, y2));
  return new Arrow(data, {...options, x1, x2, y1, y2});
}
