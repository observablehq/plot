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
    channels,
    ...options
  } = {}
) {
  x1 = cacheColumn(x1);
  x2 = cacheColumn(x2);
  y1 = cacheColumn(y1);
  y2 = cacheColumn(y2);

  // TODO handle faceting
  const clipPositive = getClipId();
  const clipNegative = getClipId();

  const areaClipPositive = area(data, {
    x1,
    x2,
    y1,
    y2,
    ...options,
    initializer: (data, facets, channels) => ({
      channels: {y1: {value: new Float32Array(channels.x1.value.length)}}
    }),
    render(index, scales, channels, dimensions, context, next) {
      const clipPath = create("svg:clipPath", context).attr("id", clipPositive).node();
      clipPath.append(...next(index, scales, channels, dimensions, context).childNodes);
      return clipPath;
    }
  });

  const areaClipNegative = area(data, {
    x1,
    x2,
    y1,
    y2,
    ...options,
    initializer: (data, facets, channels, scales, dimensions) => ({
      channels: {y1: {value: new Float32Array(channels.x1.value.length).fill(dimensions.height)}}
    }),
    render(index, scales, channels, dimensions, context, next) {
      const clipPath = create("svg:clipPath", context).attr("id", clipNegative).node();
      clipPath.append(...next(index, scales, channels, dimensions, context).childNodes);
      return clipPath;
    }
  });

  const areaPositive = area(data, {
    x1,
    x2,
    y1,
    y2,
    fill: positiveColor,
    fillOpacity: positiveOpacity,
    ...options,
    initializer: (data, facets, channels, scales, dimensions) => ({
      channels: {y2: {value: new Float32Array(channels.x2.value.length).fill(dimensions.height)}}
    }),
    render(index, scales, channels, dimensions, context, next) {
      const g = next(index, scales, channels, dimensions, context);
      g.setAttribute("clip-path", `url(#${clipPositive})`);
      return g;
    }
  });

  const areaNegative = area(data, {
    x1,
    x2,
    y1,
    y2,
    fill: negativeColor,
    fillOpacity: negativeOpacity,
    ...options,
    initializer: (data, facets, channels) => ({
      channels: {y2: {value: new Float32Array(channels.x2.value.length)}}
    }),
    render(index, scales, channels, dimensions, context, next) {
      const g = next(index, scales, channels, dimensions, context);
      g.setAttribute("clip-path", `url(#${clipNegative})`);
      return g;
    }
  });

  // reference line
  const primaryLine = lineY(data, {
    x: x1,
    y: y1,
    stroke,
    strokeOpacity,
    ...options
  });

  return marks(areaClipPositive, areaPositive, areaClipNegative, areaNegative, primaryLine);
}
