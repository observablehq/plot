import {pointer} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshair(data, options = {}) {
  const {x, y, dx = -9, dy = 9} = options;
  const p = pointer({px: x, py: y});
  return marks(
    ruleX(data, ruleOptions(p, {x}, options)),
    ruleY(data, ruleOptions(p, {y}, options)),
    text(data, textOptions(p, {y, text: y, dx, frameAnchor: "left", textAnchor: "end"}, options)),
    text(data, textOptions(p, {x, text: x, dy, frameAnchor: "bottom", lineAnchor: "top"}, options))
  );
}

function ruleOptions(
  pointer,
  options,
  {
    color = "currentColor",
    ruleStroke: stroke = color,
    ruleStrokeOpacity: strokeOpacity = 0.2,
    ruleStrokeWidth: strokeWidth
  }
) {
  return {...pointer, ...options, stroke, strokeOpacity, strokeWidth};
}

function textOptions(
  pointer,
  options,
  {
    color = "currentColor",
    textFill: fill = color,
    textStroke: stroke = "white",
    textStrokeOpacity: strokeOpacity,
    textStrokeWidth: strokeWidth = 5
  }
) {
  return {...pointer, ...options, fill, stroke, strokeOpacity, strokeWidth};
}
