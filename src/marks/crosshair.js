import {getSource} from "../channel.js";
import {pointer, pointerX, pointerY} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {initializer} from "../transforms/basic.js";
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
    const {channels: {x, y, ...c} = {}, ...rest} = i.call(this, data, facets, {...c1, x: px, y: py}, ...args);
    return {
      channels: {
        ...c,
        ...(x && {px: x, ...(ox !== null && {x})}),
        ...(y && {py: y, ...(oy !== null && {y})})
      },
      ...rest
    };
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
  options = textChannel("x", options);
  return textOptions({...pointerOptions, dy: 9, frameAnchor: "bottom", lineAnchor: "top"}, options, x, null);
}

function textYOptions(pointerOptions, options, y) {
  options = textChannel("y", options);
  return textOptions({...pointerOptions, dx: -9, frameAnchor: "left", textAnchor: "end"}, options, null, y);
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

// Rather than aliasing text to have the same definition as x and y, we use an
// initializer to alias the channel values, such that the text channel can be
// derived by an initializer such as hexbin.
function textChannel(source, options) {
  return initializer(options, (data, facets, channels) => {
    return {channels: {text: {value: getSource(channels, source)?.value}}};
  });
}
