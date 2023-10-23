import {create} from "../context.js";
import {marks} from "../mark.js";
import {identity, indexOf, labelof, valueof} from "../options.js";
import {getClipId} from "../style.js";
import {area} from "./area.js";
import {lineY} from "./line.js";

function cacheColumn(value) {
  let V;
  return {transform: (data) => V || (V = valueof(data, value)), label: labelof(value)};
}

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
    ...options
  } = {}
) {
  x1 = cacheColumn(x1);
  x2 = cacheColumn(x2);
  y1 = cacheColumn(y1);
  y2 = cacheColumn(y2);
  return marks(
    area(data, {
      x1,
      x2,
      y1,
      y2,
      fill: positiveColor,
      fillOpacity: positiveOpacity,
      ...options,
      render(index, scales, channels, dimensions, context, next) {
        const clip = getClipId();
        const clipPath = create("svg:clipPath", context).attr("id", clip).node();
        const {x1, x2} = channels;
        const {height} = dimensions;
        const y1 = new Float32Array(x1.length);
        const y2 = new Float32Array(x2.length).fill(height);
        const c = next(index, scales, {...channels, y1}, dimensions, context);
        clipPath.append(...c.childNodes);
        const g = next(index, scales, {...channels, y2}, dimensions, context);
        g.insertBefore(clipPath, g.firstChild);
        g.setAttribute("clip-path", `url(#${clip})`);
        return g;
      }
    }),
    area(data, {
      x1,
      x2,
      y1,
      y2,
      fill: negativeColor,
      fillOpacity: negativeOpacity,
      ...options,
      render(index, scales, channels, dimensions, context, next) {
        const clip = getClipId();
        const clipPath = create("svg:clipPath", context).attr("id", clip).node();
        const {x1, x2} = channels;
        const {height} = dimensions;
        const y1 = new Float32Array(x1.length).fill(height);
        const y2 = new Float32Array(x2.length);
        const c = next(index, scales, {...channels, y1}, dimensions, context);
        clipPath.append(...c.childNodes);
        const g = next(index, scales, {...channels, y2}, dimensions, context);
        g.insertBefore(clipPath, g.firstChild);
        g.setAttribute("clip-path", `url(#${clip})`);
        return g;
      }
    }),
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
