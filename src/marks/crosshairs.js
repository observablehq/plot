import {pointer} from "../interactions/pointer.js";
import {marks} from "../mark.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

export function crosshairs(
  data,
  {x, y, fill = "currentColor", stroke = "white", strokeOpacity = 0.2, strokeWidth = 5, dx = -9, dy = 9} = {}
) {
  return marks(
    ruleX(data, pointer({x, py: y, strokeOpacity})),
    ruleY(data, pointer({px: x, y, strokeOpacity})),
    text(data, pointer({px: x, y, text: y, dx, frameAnchor: "left", textAnchor: "end", fill, stroke, strokeWidth})),
    text(data, pointer({x, py: y, text: x, dy, frameAnchor: "bottom", lineAnchor: "top", fill, stroke, strokeWidth}))
  );
}
