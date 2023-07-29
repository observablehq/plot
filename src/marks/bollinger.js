import {deviation, mean} from "d3";
import {marks} from "../mark.js";
import {map} from "../transforms/map.js";
import {window} from "../transforms/window.js";
import {areaX, areaY} from "./area.js";
import {lineX, lineY} from "./line.js";
import {identity} from "../options.js";

export function bollingerX(
  data,
  {
    x = identity,
    y,
    n = 20,
    k = 2,
    color = "currentColor",
    opacity = 0.2,
    fill = color,
    fillOpacity = opacity,
    stroke = color,
    strokeOpacity,
    strokeWidth,
    ...options
  } = {}
) {
  return marks(
    areaX(data, map({x1: bollinger(n, -k), x2: bollinger(n, k)}, {x1: x, x2: x, y, fill, fillOpacity, ...options})),
    lineX(data, map({x: bollinger(n, 0)}, {x, y, stroke, strokeOpacity, strokeWidth, ...options}))
  );
}

export function bollingerY(
  data,
  {
    x,
    y = identity,
    n = 20,
    k = 2,
    color = "currentColor",
    opacity = 0.2,
    fill = color,
    fillOpacity = opacity,
    stroke = color,
    strokeOpacity,
    strokeWidth,
    ...options
  } = {}
) {
  return marks(
    areaY(data, map({y1: bollinger(n, -k), y2: bollinger(n, k)}, {x, y1: y, y2: y, fill, fillOpacity, ...options})),
    lineY(data, map({y: bollinger(n, 0)}, {x, y, stroke, strokeOpacity, strokeWidth, ...options}))
  );
}

export function bollinger(n, k) {
  return window({k: n, reduce: (Y) => mean(Y) + k * (deviation(Y) || 0), strict: true, anchor: "end"});
}
