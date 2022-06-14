import {create, curveLinear, path} from "d3";
import {Curve} from "../curve.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {markers, applyMarkers} from "./marker.js";

const defaults = {
  ariaLabel: "link",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Link extends Mark {
  constructor(data, options = {}) {
    const {
      x1,
      y1,
      x2,
      y2,
      curve,
      tension,
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
    this.curve = Curve(curve, tension);
    this.insetStart = +insetStart;
    this.insetEnd = +insetEnd;
    if ((this.insetStart || this.insetEnd) && this.curve !== curveLinear) {
      throw new Error("link insets are only compatible with the default linear curve");
    }
    markers(this, options);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    const {dx, dy, curve, insetStart, insetEnd} = this;
    const coords = this.insetStart || this.insetEnd
    ? (i) => {
      const dx = X2[i] - X1[i];
      const dy = Y2[i] - Y1[i];
      const lineLength = Math.hypot(dx, dy);
      if (lineLength <= insetStart + insetEnd || lineLength === 0) return [];
      return [
        X1[i] + insetStart * dx / lineLength,
        Y1[i] + insetStart * dy / lineLength,
        X2[i] - insetEnd * dx / lineLength,
        Y2[i] - insetEnd * dy / lineLength
      ];
    }
    : (i) => [X1[i], Y1[i], X2[i], Y2[i]];
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .attr("d", i => {
              const p = path();
              const c = curve(p);
              c.lineStart();
              const [x1, y1, x2, y2] = coords(i);
              if (x1 !== undefined) {
                c.point(x1, y1);
                c.point(x2, y2);
              }
              c.lineEnd();
              return p;
            })
            .call(applyChannelStyles, this, channels)
            .call(applyMarkers, this, channels))
      .node();
  }
}

export function link(data, {x, x1, x2, y, y1, y2, ...options} = {}) {
  ([x1, x2] = maybeSameValue(x, x1, x2));
  ([y1, y2] = maybeSameValue(y, y1, y2));
  return new Link(data, {...options, x1, x2, y1, y2});
}

// If x1 and x2 are specified, return them as {x1, x2}.
// If x and x1 and specified, or x and x2 are specified, return them as {x1, x2}.
// If only x, x1, or x2 are specified, return it as {x1}.
export function maybeSameValue(x, x1, x2) {
  if (x === undefined) {
    if (x1 === undefined) {
      if (x2 !== undefined) return [x2];
    } else {
      if (x2 === undefined) return [x1];
    }
  } else if (x1 === undefined) {
    return x2 === undefined ? [x] : [x, x2];
  } else if (x2 === undefined) {
    return [x, x1];
  }
  return [x1, x2];
}
