import {legendColor} from "./color.js";

export function legendOpacity(scale) {
  return legendColor({
    ...scale,
    domain: [0, 1],
    interpolate: t => `rgb(${(1-t)*256}, ${(1-t)*256}, ${(1-t)*256})`
    // scheme: "greys"
  });
}
