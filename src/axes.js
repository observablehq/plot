import {isOrdinalScale} from "./scales.js";

export function inferFontVariant(scale) {
  return isOrdinalScale(scale) && scale.interval === undefined ? undefined : "tabular-nums";
}
