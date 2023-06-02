import {format, utcFormat} from "d3";
import {formatIsoDate} from "./format.js";
import {constant, isTemporal, string} from "./options.js";
import {isOrdinalScale} from "./scales.js";

export function inferFontVariant(scale) {
  return isOrdinalScale(scale) && scale.interval === undefined ? undefined : "tabular-nums";
}

// D3 doesn’t provide a tick format for ordinal scales; we want shorthand when
// an ordinal domain is numbers or dates, and we want null to mean the empty
// string, not the default identity format. TODO Remove this in favor of the
// axis mark’s inferTickFormat.
export function maybeAutoTickFormat(tickFormat, domain) {
  return tickFormat === undefined
    ? isTemporal(domain)
      ? formatIsoDate
      : string
    : typeof tickFormat === "function"
    ? tickFormatWrap(tickFormat)
    : (typeof tickFormat === "string" ? (isTemporal(domain) ? utcFormat : format) : constant)(tickFormat);
}

// D3 axes typically call the tickFormat function with the tick value, index,
// and array of nodes; for Plot, the third argument is the array of tick values.
export function tickFormatWrap(tickFormat) {
  return (t, i, nodes) =>
    tickFormat(
      t,
      i,
      nodes.map((d) => d.__data__)
    );
}
