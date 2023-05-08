import {pointer} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshair(data, options = {}) {
  const {x, y, dx = -9, dy = 9} = options;
  const p = pointer({px: x, py: y});
  return marks(
    ruleX(data, {...p, x, ...ruleOptions(options)}),
    ruleY(data, {...p, y, ...ruleOptions(options)}),
    text(data, {...p, y, text: y, dx, frameAnchor: "left", textAnchor: "end", ...textOptions(options)}),
    text(data, {...p, x, text: x, dy, frameAnchor: "bottom", lineAnchor: "top", ...textOptions(options)})
  );
}

function ruleOptions({
  color = "currentColor",
  ruleStroke: stroke = color,
  ruleStrokeOpacity: strokeOpacity = 0.2,
  ruleStrokeWidth: strokeWidth
}) {
  return {stroke, strokeOpacity, strokeWidth};
}

function textOptions({
  color = "currentColor",
  textFill: fill = color,
  textStroke: stroke = "white",
  textStrokeOpacity: strokeOpacity,
  textStrokeWidth: strokeWidth = 5
}) {
  return {fill, stroke, strokeOpacity, strokeWidth};
}
