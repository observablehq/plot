import {create, path} from "d3";
import {filter} from "../defined.js";
import {Mark} from "../plot.js";
import {Curve} from "../curve.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Link extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2, curve} = options;
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
    this.curve = Curve(curve);
  }
  render(I, {x, y}, channels) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    const {dx, dy} = this;
    const index = filter(I, X1, Y1, X2, Y2);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => {
              const p = path();
              const c = this.curve(p);
              c.lineStart();
              c.point(X1[i], Y1[i]);
              c.point(X2[i], Y2[i]);
              c.lineEnd();
              return `${p}`;
            })
            .call(applyChannelStyles, this, channels))
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
function maybeSameValue(x, x1, x2) {
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
