import {legendColor} from "./color.js";

export function legendOpacity(opacity, options) {
  return legendColor({
    ...opacity,
    domain: [0, 1],
    interpolate: t => `rgb(${(1-t)*256}, ${(1-t)*256}, ${(1-t)*256})`
    // scheme: "greys"
  }, options);
}
