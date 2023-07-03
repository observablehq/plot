import {treemapNode} from "../transforms/treemap.js";
import {marks} from "../mark.js";
import {rect} from "./rect.js";
import {text as textMark} from "./text.js";

/** @jsdoc treemap */
export function treemap(
  data,
  {
    inset = 0.5,
    insetTop = inset,
    insetRight = inset,
    insetBottom = inset,
    insetLeft = inset,
    text = "node:name",
    clip = "box",
    value,
    title = value != null ? "node:title" : "node:name",
    ...options
  } = {}
) {
  const r = rect(
    data,
    treemapNode({
      value,
      insetTop,
      insetRight,
      insetBottom,
      insetLeft,
      title,
      ...options
    })
  );
  return text == null
    ? r
    : marks([
        r,
        textMark(
          data,
          treemapNode({
            value,
            insetTop,
            insetRight,
            insetBottom,
            insetLeft,
            text,
            clip,
            ...options,
            fill: "currentColor",
            pointerEvents: "none",
            tip: false
          })
        )
      ]);
}
