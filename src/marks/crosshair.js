import {getSource} from "../channel.js";
import {pointer, pointerX, pointerY} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshair(data, options) {
  return crosshairK(pointer, data, options);
}

export function crosshairX(data, options = {}) {
  return crosshairK(pointerX, data, options);
}

export function crosshairY(data, options = {}) {
  return crosshairK(pointerY, data, options);
}

function crosshairK(pointer, data, options = {}) {
  const {x, y, maxRadius} = options;
  const p = pointer({px: x, py: y, maxRadius});
  const M = [];
  if (x != null) M.push(ruleX(data, ruleOptions("x", {...p, inset: -6}, options)));
  if (y != null) M.push(ruleY(data, ruleOptions("y", {...p, inset: -6}, options)));
  if (x != null) M.push(text(data, textOptions("x", {...p, dy: 9, frameAnchor: "bottom", lineAnchor: "top"}, options)));
  if (y != null) M.push(text(data, textOptions("y", {...p, dx: -9, frameAnchor: "left", textAnchor: "end"}, options)));
  for (const m of M) m.ariaLabel = `crosshair ${m.ariaLabel}`;
  return marks(...M);
}

function markOptions(
  k,
  {channels: pointerChannels, ...pointerOptions},
  {facet, facetAnchor, fx, fy, [k]: p, channels, transform, initializer}
) {
  return {
    ...pointerOptions,
    facet,
    facetAnchor,
    fx,
    fy,
    [k]: p,
    channels: {...pointerChannels, ...channels},
    transform,
    initializer: pxpy(k, initializer)
  };
}

// Wrap the initializer, if any, mapping px and py to x and y temporarily (e.g.,
// for hexbin) then mapping back to px and py for rendering.
function pxpy(k, i) {
  if (i == null) return i;
  return function (data, facets, {x: x1, y: y1, px, py, ...c1}, ...args) {
    const {channels: {x, y, ...c} = {}, ...rest} = i.call(this, data, facets, {...c1, x: px, y: py}, ...args);
    return {
      channels: {
        ...c,
        ...(x && {px: x, ...(k === "x" && {x})}),
        ...(y && {py: y, ...(k === "y" && {y})})
      },
      ...rest
    };
  };
}

function ruleOptions(k, pointerOptions, options) {
  const {
    color = "currentColor",
    opacity = 0.2,
    ruleStroke: stroke = color,
    ruleStrokeOpacity: strokeOpacity = opacity,
    ruleStrokeWidth: strokeWidth
  } = options;
  return {
    ...markOptions(k, pointerOptions, options),
    stroke,
    strokeOpacity,
    strokeWidth
  };
}

function textOptions(k, pointerOptions, options) {
  const {
    color = "currentColor",
    textFill: fill = color,
    textFillOpacity: fillOpacity,
    textStroke: stroke = "var(--plot-background)",
    textStrokeOpacity: strokeOpacity,
    textStrokeWidth: strokeWidth = 5
  } = options;
  return {
    ...markOptions(k, pointerOptions, textChannel(k, options)),
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    strokeWidth
  };
}

// Rather than aliasing text to have the same definition as x and y, we use an
// initializer to alias the channel values, such that the text channel can be
// derived by an initializer such as hexbin.
function textChannel(source, options) {
  return initializer(options, (data, facets, channels) => {
    return {channels: {text: {value: getSource(channels, source)?.value}}};
  });
}
