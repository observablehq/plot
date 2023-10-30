import {max, min} from "d3";
import {create} from "../context.js";
import {composeRender, marks, withTip} from "../mark.js";
import {identity, indexOf, isNoneish, labelof, maybeInterval, maybeValue, valueof} from "../options.js";
import {inferScaleOrder} from "../scales.js";
import {getClipId} from "../style.js";
import {parseTimeInterval} from "../time.js";
import {map} from "../transforms/map.js";
import {area} from "./area.js";
import {line} from "./line.js";

export function differenceY(
  data,
  {
    x1,
    x2,
    y1,
    y2,
    x = x1 === undefined && x2 === undefined ? indexOf : undefined,
    y = y1 === undefined && y2 === undefined ? identity : undefined,
    positiveFill = "#01ab63",
    negativeFill = "#4269d0",
    fillOpacity = 1,
    positiveFillOpacity = fillOpacity,
    negativeFillOpacity = fillOpacity,
    shift,
    stroke,
    strokeOpacity,
    tip,
    render,
    ...options
  } = {}
) {
  [x1, x2] = memoTuple(x, x1, x2);
  [y1, y2] = memoTuple(y, y1, y2);
  if (shift != null) ({x1, x2, ...options} = shiftK("x", shift, {x1, x2, ...options}));
  if (x1 === x2 && y1 === y2) y1 = memo(0);
  ({tip} = withTip({tip}, "x"));
  return marks(
    !isNoneish(positiveFill)
      ? Object.assign(
          area(data, {
            x1,
            x2,
            y1,
            y2,
            fill: positiveFill,
            fillOpacity: positiveFillOpacity,
            render: composeRender(render, clipDifference(true)),
            ...options
          }),
          {ariaLabel: "positive difference"}
        )
      : null,
    !isNoneish(negativeFill)
      ? Object.assign(
          area(data, {
            x1,
            x2,
            y1,
            y2,
            fill: negativeFill,
            fillOpacity: negativeFillOpacity,
            render: composeRender(render, clipDifference(false)),
            ...options
          }),
          {ariaLabel: "negative difference"}
        )
      : null,
    line(data, {
      x: x2,
      y: y2,
      stroke,
      strokeOpacity,
      tip,
      ...options
    })
  );
}

function memoTuple(x, x1, x2) {
  if (x1 === undefined && x2 === undefined) {
    // {x} → [x, x]
    x1 = x2 = memo(x);
  } else if (x1 === undefined) {
    // {x2} → [x2, x2]
    // {x, x2} → [x, x2]
    x2 = memo(x2);
    x1 = x === undefined ? x2 : memo(x);
  } else if (x2 === undefined) {
    // {x1} → [x1, x1]
    // {x, x1} → [x1, x]
    x1 = memo(x1);
    x2 = x === undefined ? x1 : memo(x);
  } else {
    // {x1, x2} → [x1, x2]
    x1 = memo(x1);
    x2 = memo(x2);
  }
  return [x1, x2];
}

function memo(v) {
  let V;
  const {value, label = labelof(value)} = maybeValue(v);
  return {transform: (data) => V || (V = valueof(data, value)), label};
}

function clipDifference(positive) {
  return (index, scales, channels, dimensions, context, next) => {
    const clip = getClipId();
    const clipPath = create("svg:clipPath", context).attr("id", clip).node();
    const {x1, x2} = channels;
    const {height} = dimensions;
    const y1 = new Float32Array(x1.length);
    const y2 = new Float32Array(x2.length);
    (positive === inferScaleOrder(scales.y) < 0 ? y1 : y2).fill(height);
    const c = next(index, scales, {...channels, x2: x1, y2}, dimensions, context);
    clipPath.append(...c.childNodes);
    const g = next(index, scales, {...channels, x1: x2, y1}, dimensions, context);
    g.insertBefore(clipPath, g.firstChild);
    g.setAttribute("clip-path", `url(#${clip})`);
    return g;
  };
}

function shiftK(x, interval, options) {
  let offset;
  let k = 1;
  if (typeof interval === "number") {
    k = interval;
    offset = (x, k) => +x + k;
  } else {
    if (typeof interval === "string") {
      const sign = interval.startsWith("-") ? -1 : 1;
      [interval, k] = parseTimeInterval(interval.replace(/^[+-]/, ""));
      k *= sign;
    }
    interval = maybeInterval(interval);
    offset = (x, k) => interval.offset(x, k);
  }
  return map(
    k < 1
      ? {
          [`${x}1`](D) {
            const start = offset(min(D), -k);
            return D.map((d) => (d < start ? null : offset(d, k)));
          },
          [`${x}2`](D) {
            const end = offset(max(D), k);
            return D.map((d) => (end < d ? null : d));
          }
        }
      : {
          [`${x}1`](D) {
            const end = offset(max(D), -k);
            return D.map((d) => (end < d ? null : offset(d, k)));
          },
          [`${x}2`](D) {
            const start = offset(min(D), k);
            return D.map((d) => (d < start ? null : d));
          }
        },
    options
  );
}
