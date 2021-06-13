import {scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor({width, ...options}, {width: maxWidth}) {
  switch(options.type) {
    case "ordinal":
    case "categorical":
      return legendSwatches(scale(options), options);
  }
  return legendRamp(scale(options), {
    width: width !== undefined ? width : Math.min(240, maxWidth),
    ...options
  });
}
