import {plot} from "../plot.js";
import {link} from "../marks/link.js";
import {text} from "../marks/text.js";
import {dot} from "../marks/dot.js";
import {scale} from "../scales.js";

export function legendRadius(r, {
  label,
  ticks = 5,
  tickFormat = (d) => d,
  strokeWidth = 0.5,
  strokeDasharray = [5, 4],
  minStep = 8,
  gap = 20
}) {
  const s = scale(r);
  const r0 = s.range()[1];

  const shiftY = label ? 10 : 0;

  let h = Infinity;
  const values = s
    .ticks(ticks)
    .reverse()
    .filter((t) => h - s(t) > minStep / 2 && (h = s(t)));

  return plot({
    x: { type: "identity", axis: null },
    r: { type: "identity" },
    y: { type: "identity", axis: null },
    marks: [
      link(values, {
        x1: r0 + 2,
        y1: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        x2: 2 * r0 + 2 + gap,
        y2: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        strokeWidth: strokeWidth / 2,
        strokeDasharray
      }),
      dot(values, {
        r: s,
        x: r0 + 2,
        y: (d) => 8 + 2 * r0 - s(d) + shiftY,
        strokeWidth
      }),
      text(values, {
        x: 2 * r0 + 2 + gap,
        y: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        textAnchor: "start",
        dx: 4,
        text: tickFormat
      }),
      text(label ? [label] : [], {
        x: 0,
        y: 6,
        textAnchor: "start",
        fontWeight: "bold",
        text: tickFormat
      })
    ],
    height: 2 * r0 + 10 + shiftY
  });
}
