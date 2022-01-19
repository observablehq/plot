import * as Plot from "../index.js";
import {maybeClassName} from "../style.js";

export function legendRadius(scale, {
  label = scale.label,
  ticks = 5,
  tickFormat = d => d,
  strokeWidth = 0.5,
  strokeDasharray = [5, 4],
  lineHeight = 8,
  gap = 20,
  style,
  className
}) {
  className = maybeClassName(className);
  const s = scale.scale;
  const r0 = scale.range[1];
  const shiftY = label ? 10 : 0;

  let h = Infinity;
  const values = s.ticks(ticks).reverse()
    .filter((t) => h - s(t) > lineHeight / 2 && (h = s(t)));

  return Plot.plot({
    x: { type: "identity", axis: null },
    r: { type: "identity" },
    y: { type: "identity", axis: null },
    marks: [
      Plot.link(values, {
        x1: r0 + 2,
        y1: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        x2: 2 * r0 + 2 + gap,
        y2: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        strokeWidth: strokeWidth / 2,
        strokeDasharray
      }),
      Plot.dot(values, {
        r: s,
        x: r0 + 2,
        y: (d) => 8 + 2 * r0 - s(d) + shiftY,
        strokeWidth
      }),
      Plot.text(values, {
        x: 2 * r0 + 2 + gap,
        y: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        textAnchor: "start",
        dx: 4,
        text: tickFormat
      }),
      Plot.text(label ? [label] : [], {
        x: 0,
        y: 6,
        textAnchor: "start",
        fontWeight: "bold",
        text: tickFormat
      })
    ],
    height: 2 * r0 + 10 + shiftY,
    className,
    style
  });
}