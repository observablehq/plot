import {create} from "../context.js";
import {composeRender, marks} from "../mark.js";
import {identity, indexOf, labelof, valueof} from "../options.js";
import {getClipId} from "../style.js";
import {area} from "./area.js";
import {lineY} from "./line.js";

export function differenceY(
  data,
  {
    x = indexOf,
    x1 = x,
    x2 = x,
    y = identity,
    y1 = y,
    y2 = y,
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
  x1 = cacheColumn(x1);
  x2 = cacheColumn(x2);
  y1 = cacheColumn(y1);
  y2 = cacheColumn(y2);
  return marks(
    Object.assign(
      area(data, {
        x1,
        x2,
        y1,
        y2,
        fill: positiveColor,
        fillOpacity: positiveOpacity,
        render: composeRender(render, renderDifference(true)),
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
        render: composeRender(render, renderDifference(false)),
        ...options
      }),
      {ariaLabel: "negative difference"}
    ),
    lineY(data, {
      x: x1,
      y: y1,
      stroke,
      strokeOpacity,
      tip,
      ...options
    })
  );
}

function cacheColumn(value) {
  let V;
  return {
    transform: (data) => V || (V = valueof(data, value)),
    label: labelof(value)
  };
}

function renderDifference(positive) {
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
