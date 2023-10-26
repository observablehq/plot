import {create} from "../context.js";
import {composeRender, marks, withTip} from "../mark.js";
import {identity, indexOf, isNoneish, labelof, maybeValue, valueof} from "../options.js";
import {getClipId} from "../style.js";
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
    stroke,
    strokeOpacity,
    tip,
    render,
    ...options
  } = {}
) {
  [x1, x2] = memoTuple(x, x1, x2);
  [y1, y2] = memoTuple(y, y1, y2);
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
    (positive ? y1 : y2).fill(height);
    const c = next(index, scales, {...channels, x2: x1, y2}, dimensions, context);
    clipPath.append(...c.childNodes);
    const g = next(index, scales, {...channels, x1: x2, y1}, dimensions, context);
    g.insertBefore(clipPath, g.firstChild);
    g.setAttribute("clip-path", `url(#${clip})`);
    return g;
  };
}
