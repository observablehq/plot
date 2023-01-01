import {format, utcFormat} from "d3";
import {formatIsoDate} from "./format.js";
import {constant, isTemporal, string} from "./options.js";
import {isOrdinalScale, isTemporalScale, scaleOrder} from "./scales.js";

// Mutates axis.{label,labelAnchor,labelOffset} and scale.label!
export function autoScaleLabels(channels, scales, dimensions, options) {
  const {x, y, fx, fy} = {}; // TODO
  if (fx) {
    autoAxisLabelsX(fx, scales.fx, channels.get("fx"));
    if (fx.labelOffset === undefined) {
      const {facetMarginTop, facetMarginBottom} = dimensions;
      fx.labelOffset = fx.axis === "top" ? facetMarginTop : facetMarginBottom;
    }
  }
  if (fy) {
    autoAxisLabelsY(fy, fx, scales.fy, channels.get("fy"));
    if (fy.labelOffset === undefined) {
      const {facetMarginLeft, facetMarginRight} = dimensions;
      fy.labelOffset = fy.axis === "left" ? facetMarginLeft : facetMarginRight;
    }
  }
  if (x) {
    autoAxisLabelsX(x, scales.x, channels.get("x"));
    if (x.labelOffset === undefined) {
      const {marginTop, marginBottom, facetMarginTop, facetMarginBottom} = dimensions;
      x.labelOffset = x.axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    }
  }
  if (y) {
    autoAxisLabelsY(y, x, scales.y, channels.get("y"));
    if (y.labelOffset === undefined) {
      const {marginRight, marginLeft, facetMarginLeft, facetMarginRight} = dimensions;
      y.labelOffset = y.axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    }
  }
  for (const key in scales) {
    autoScaleLabel(key, scales[key], channels.get(key), options[key]);
  }
}

// Mutates axis.labelAnchor, axis.label, scale.label!
function autoAxisLabelsX(axis, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = isOrdinalScale(scale) ? "center" : scaleOrder(scale) < 0 ? "left" : "right";
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "x");
  }
  scale.label = axis.label;
}

// Mutates axis.labelAnchor, axis.label, scale.label!
function autoAxisLabelsY(axis, opposite, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = isOrdinalScale(scale)
      ? "center"
      : opposite && opposite.axis === "top"
      ? "bottom" // TODO scaleOrder?
      : "top";
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "y");
  }
  scale.label = axis.label;
}

// Mutates scale.label!
function autoScaleLabel(key, scale, channels, options) {
  if (options) {
    scale.label = options.label;
  }
  if (scale.label === undefined) {
    scale.label = inferLabel(channels, scale, null, key);
  }
  if (scale.scale) {
    scale.scale.label = scale.label; // TODO cleaner way of exposing scale
  }
}

// Channels can have labels; if all the channels for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and the
// corresponding axis doesn’t already have an explicit label, then the channels’
// label is promoted to the corresponding axis.
function inferLabel(channels = [], scale, axis, key) {
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
          if (key === "x" || (axis && axis.labelAnchor === "center")) {
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
