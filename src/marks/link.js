import {geoPath, pathRound as path} from "d3";
import {create} from "../context.js";
import {curveAuto, maybeCurveAuto} from "../curve.js";
import {Mark} from "../mark.js";
import {markers, applyMarkers} from "../marker.js";
import {coerceNumbers} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "link",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Link extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2, curve, tension} = options;
    super(
      data,
      {
        x1: {value: x1, scale: "x"},
        y1: {value: y1, scale: "y"},
        x2: {value: x2, scale: "x", optional: true},
        y2: {value: y2, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this.curve = maybeCurveAuto(curve, tension);
    markers(this, options);
  }
  project(channels, values, context) {
    // For the auto curve, projection is handled at render.
    if (this.curve !== curveAuto) {
      super.project(channels, values, context);
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    const {curve} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr(
            "d",
            curve === curveAuto && context.projection
              ? sphereLink(context.projection, X1, Y1, X2, Y2)
              : (i) => {
                  const p = path();
                  const c = curve(p);
                  c.lineStart();
                  c.point(X1[i], Y1[i]);
                  c.point(X2[i], Y2[i]);
                  c.lineEnd();
                  return p;
                }
          )
          .call(applyChannelStyles, this, channels)
          .call(applyMarkers, this, channels, context)
      )
      .node();
  }
}

function sphereLink(projection, X1, Y1, X2, Y2) {
  const path = geoPath(projection);
  X1 = coerceNumbers(X1);
  Y1 = coerceNumbers(Y1);
  X2 = coerceNumbers(X2);
  Y2 = coerceNumbers(Y2);
  return (i) =>
    path({
      type: "LineString",
      coordinates: [
        [X1[i], Y1[i]],
        [X2[i], Y2[i]]
      ]
    });
}

export function link(data, options = {}) {
  let {x, x1, x2, y, y1, y2, ...remainingOptions} = options;
  [x1, x2] = maybeSameValue(x, x1, x2);
  [y1, y2] = maybeSameValue(y, y1, y2);
  return new Link(data, {...remainingOptions, x1, x2, y1, y2});
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
