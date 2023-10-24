import {create} from "../context.js";
import {composeRender, marks} from "../mark.js";
import {identity, indexOf, labelof, maybeValue, valueof} from "../options.js";
import {getClipId} from "../style.js";
import {area} from "./area.js";
import {lineY} from "./line.js";

export function differenceY(
  data,
  {
    x,
    x1,
    x2,
    y,
    y1,
    y2,
    positiveColor = "#01ab63",
    negativeColor = "#4269d0",
    opacity = 1,
    positiveOpacity = opacity,
    negativeOpacity = opacity,
    stroke,
    strokeOpacity,
    tip,
    render,
    ...options
  } = {}
) {
  [x1, x2] = memoTuple(x, x1, x2, indexOf);
  [y1, y2] = memoTuple(y, y1, y2, identity);
  return marks(
    Object.assign(
      area(data, {
        x1,
        x2,
        y1,
        y2,
        fill: positiveColor,
        fillOpacity: positiveOpacity,
        render: composeRender(render, clipDifference(true)),
        ...options
      }),
      {ariaLabel: "positive difference"}
    ),
    Object.assign(
      area(data, {
        x1,
        x2,
        y1,
        y2,
        fill: negativeColor,
        fillOpacity: negativeOpacity,
        render: composeRender(render, clipDifference(false)),
        ...options
      }),
      {ariaLabel: "negative difference"}
    ),
    lineY(data, {
      x: x1,
      y: y1,
      stroke,
      strokeOpacity,
      tip: tip && {...(x1 === x2 ? {x: x1} : {x1, x2}), ...(y1 === y2 ? {y: y1} : {y1, y2}), ...tip},
      ...options
    })
  );
}

function memoTuple(x, x1, x2, x3) {
  if (x1 === undefined && x2 === undefined) {
    // {} → [x3, x3]
    // {x} → [x, x]
    x1 = x2 = memo(x === undefined ? x3 : x);
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
    (positive ? y2 : y1).fill(height);
    const c = next(index, scales, {...channels, x1: x2, y1}, dimensions, context);
    clipPath.append(...c.childNodes);
    const g = next(index, scales, {...channels, x2: x1, y2}, dimensions, context);
    g.insertBefore(clipPath, g.firstChild);
    g.setAttribute("clip-path", `url(#${clip})`);
    return g;
  };
}
