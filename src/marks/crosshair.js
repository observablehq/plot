import {pointer} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshair(data, options = {}) {
  const {x, y, dx = -9, dy = 9} = options;
  return marks(
    ruleX(data, ruleOptions({x, py: y}, options)),
    ruleY(data, ruleOptions({px: x, y}, options)),
    text(data, textOptions({px: x, y, text: y, dx, frameAnchor: "left", textAnchor: "end"}, options)),
    text(data, textOptions({x, py: y, text: x, dy, frameAnchor: "bottom", lineAnchor: "top"}, options))
  );
}

function ruleOptions(
  options,
  {
    color = "currentColor",
    ruleStroke: stroke = color,
    ruleStrokeOpacity: strokeOpacity = 0.2,
    ruleStrokeWidth: strokeWidth
  }
) {
  return pointer({...options, stroke, strokeOpacity, strokeWidth});
}

function textOptions(
  options,
  {
    color = "currentColor",
    textFill: fill = color,
    textStroke: stroke = "white",
    textStrokeOpacity: strokeOpacity,
    textStrokeWidth: strokeWidth = 5
  }
) {
  return pointer({...options, fill, stroke, strokeOpacity, strokeWidth});
}
