import {pointer, pointerX, pointerY} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshair(data, options = {}) {
  const {x, y} = options;
  const p = pointer({px: x, py: y});
  return marks(
    ruleX(data, ruleXOptions(p, options, x)),
    ruleY(data, ruleYOptions(p, options, y)),
    text(data, textXOptions(p, options, x)),
    text(data, textYOptions(p, options, y))
  );
}

export function crosshairX(data, options = {}) {
  const {x} = options;
  const p = pointerX({px: x});
  return marks(ruleX(data, ruleXOptions(p, options, x)), text(data, textXOptions(p, options, x)));
}

export function crosshairY(data, options = {}) {
  const {y} = options;
  const p = pointerY({py: y});
  return marks(ruleY(data, ruleYOptions(p, options, y)), text(data, textYOptions(p, options, y)));
}

function markOptions(
  {channels: pointerChannels, ...pointerOptions},
  {facet, facetAnchor, fx, fy, channels, transform, initializer},
  x,
  y
) {
  return {
    ...pointerOptions,
    facet,
    facetAnchor,
    fx,
    fy,
    x,
    y,
    channels: {...pointerChannels, ...channels},
    transform,
    initializer: pxpy(initializer, x, y)
  };
}

// Wrap the initializer, if any, mapping px and py to x and y temporarily (e.g.,
// for hexbin) then mapping back to px and py for rendering.
function pxpy(i, ox, oy) {
  if (i == null) return i;
  return function (data, facets, {x: x1, y: y1, px, py, ...c1}, ...args) {
    const {channels: {x, y, ...c} = {}, ...r} = i.call(this, data, facets, {...c1, x: px, y: py}, ...args);
    return {channels: {...c, px: x, py: y, ...(ox !== null && {x}), ...(oy !== null && {y})}, ...r};
  };
}

function ruleXOptions(pointerOptions, options, x) {
  return ruleOptions(pointerOptions, options, x, null);
}

function ruleYOptions(pointerOptions, options, y) {
  return ruleOptions(pointerOptions, options, null, y);
}

function ruleOptions(pointerOptions, options, x, y) {
  const {
    color = "currentColor",
    ruleStroke: stroke = color,
    ruleStrokeOpacity: strokeOpacity = 0.2,
    ruleStrokeWidth: strokeWidth
  } = options;
  return {...markOptions(pointerOptions, options, x, y), stroke, strokeOpacity, strokeWidth};
}

function textXOptions(pointerOptions, options, x) {
  return textOptions({...pointerOptions, text: x, dy: 9, frameAnchor: "bottom", lineAnchor: "top"}, options, x, null);
}

function textYOptions(pointerOptions, options, y) {
  return textOptions({...pointerOptions, text: y, dx: -9, frameAnchor: "left", textAnchor: "end"}, options, null, y);
}

function textOptions(pointerOptions, options, x, y) {
  const {
    color = "currentColor",
    textFill: fill = color,
    textStroke: stroke = "white",
    textStrokeOpacity: strokeOpacity,
    textStrokeWidth: strokeWidth = 5
  } = options;
  return {...markOptions(pointerOptions, options, x, y), fill, stroke, strokeOpacity, strokeWidth};
}
