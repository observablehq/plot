import {format, utcFormat} from "d3";
import {formatIsoDate} from "./format.js";
import {constant, isTemporal, string} from "./options.js";
import {isOrdinalScale, isTemporalScale, scaleOrder} from "./scales.js";

// Mutates scale.label!
export function autoScaleLabels(channels, scales, options) {
  for (const [key, scale] of Object.entries(scales)) {
    if (scale.label === undefined) {
      const {label = inferScaleLabel(channels.get(key), scale, key)} = options[key] ?? {};
      scale.label = label;
    }
    if (scale.scale) {
      scale.scale.label = scale.label; // TODO cleaner way of exposing scale
    }
  }
}

// Channels can have labels; if all the channels for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and the
// corresponding scale doesn’t already have an explicit label, then the
// channels’ label is promoted to the scale.
function inferScaleLabel(channels = [], scale, key) {
  let candidate;
  for (const {label} of channels) {
    if (label === undefined) continue;
    if (candidate === undefined) candidate = label;
    else if (candidate !== label) return;
  }
  if (candidate !== undefined) {
    // Ignore the implicit label for temporal scales if it’s simply “date”.
    if (isTemporalScale(scale) && /^(date|time|year)$/i.test(candidate)) return;
    if (!isOrdinalScale(scale)) {
      if (scale.percent) candidate = `${candidate} (%)`;
      if (key === "x" || key === "y") {
        const order = scaleOrder(scale);
        if (order) {
          // TODO key === "y" && axis?.labelAnchor === "center"
          if (key === "x") {
            candidate = (key === "x") === order < 0 ? `← ${candidate}` : `${candidate} →`;
          } else {
            candidate = `${order < 0 ? "↑ " : "↓ "}${candidate}`;
          }
        }
      }
    }
  }
  return candidate;
}

export function inferFontVariant(scale) {
  return isOrdinalScale(scale) && scale.interval === undefined ? undefined : "tabular-nums";
}

// D3 doesn’t provide a tick format for ordinal scales; we want shorthand when
// an ordinal domain is numbers or dates, and we want null to mean the empty
// string, not the default identity format.
export function maybeAutoTickFormat(tickFormat, domain) {
  return tickFormat === undefined
    ? isTemporal(domain)
      ? formatIsoDate
      : string
    : typeof tickFormat === "function"
    ? tickFormat
    : (typeof tickFormat === "string" ? (isTemporal(domain) ? utcFormat : format) : constant)(tickFormat);
}
