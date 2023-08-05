import {deviation, mean} from "d3";
import {marks} from "../mark.js";
import {identity, isNoneish} from "../options.js";
import {map} from "../transforms/map.js";
import {window} from "../transforms/window.js";
import {areaX, areaY} from "./area.js";
import {lineX, lineY} from "./line.js";

const defaults = {
  n: 20,
  k: 2,
  color: "currentColor",
  opacity: 0.2,
  strict: true,
  anchor: "end"
};

export function bollingerX(
  data,
  {
    x = identity,
    y,
    k = defaults.k,
    color = defaults.color,
    opacity = defaults.opacity,
    fill = color,
    fillOpacity = opacity,
    stroke = color,
    strokeOpacity,
    strokeWidth,
    ...options
  } = {}
) {
  return marks(
    isNoneish(fill)
      ? null
      : areaX(
          data,
          map(
            {x1: bollinger({k: -k, ...options}), x2: bollinger({k, ...options})},
            {x1: x, x2: x, y, fill, fillOpacity, ...options}
          )
        ),
    isNoneish(stroke)
      ? null
      : lineX(data, map({x: bollinger(options)}, {x, y, stroke, strokeOpacity, strokeWidth, ...options}))
  );
}

export function bollingerY(
  data,
  {
    x,
    y = identity,
    k = defaults.k,
    color = defaults.color,
    opacity = defaults.opacity,
    fill = color,
    fillOpacity = opacity,
    stroke = color,
    strokeOpacity,
    strokeWidth,
    ...options
  } = {}
) {
  return marks(
    isNoneish(fill)
      ? null
      : areaY(
          data,
          map(
            {y1: bollinger({k: -k, ...options}), y2: bollinger({k, ...options})},
            {x, y1: y, y2: y, fill, fillOpacity, ...options}
          )
        ),
    isNoneish(stroke)
      ? null
      : lineY(data, map({y: bollinger(options)}, {x, y, stroke, strokeOpacity, strokeWidth, ...options}))
  );
}

export function bollinger({n = defaults.n, k = 0, strict = defaults.strict, anchor = defaults.anchor} = {}) {
  return window({k: n, reduce: (Y) => mean(Y) + k * (deviation(Y) || 0), strict, anchor});
}
