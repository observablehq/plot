import {maybeInterval} from "../options.js";
import {mapX, mapY} from "./map.js";

export function quantizeX(interval, options) {
  if (arguments.length === 1) ({interval, ...options} = interval);
  return mapX(quantizeMap(interval), options);
}

export function quantizeY(interval, options) {
  if (arguments.length === 1) ({interval, ...options} = interval);
  return mapY(quantizeMap(interval), options);
}

export function quantizeMap(interval, type) {
  interval = maybeInterval(interval, type);
  return {
    mapIndex(I, S, T) {
      T.interval = interval; // hint for scales
      for (let i = 0, n = I.length; i < n; ++i) {
        T[I[i]] = interval.floor(S[I[i]]);
      }
    }
  };
}
