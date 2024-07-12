import {create} from "../context.js";
import {composeRender, marks, withTip} from "../mark.js";
import {identity, indexOf, isNoneish, labelof, maybeColorChannel, maybeValue, valueof} from "../options.js";
import {inferScaleOrder} from "../scales.js";
import {getClipId} from "../style.js";
import {area} from "./area.js";
import {line} from "./line.js";

export function differenceX(data, options) {
  return differenceK("x", data, options);
}

export function differenceY(data, options) {
  return differenceK("y", data, options);
}

function differenceK(
  k,
  data,
  {
    x1,
    x2,
    y1,
    y2,
    x = x1 === undefined && x2 === undefined ? (k === "y" ? indexOf : identity) : undefined,
    y = y1 === undefined && y2 === undefined ? (k === "x" ? indexOf : identity) : undefined,
    fill, // ignored
    positiveFill = "#3ca951",
    negativeFill = "#4269d0",
    fillOpacity = 1,
    positiveFillOpacity = fillOpacity,
    negativeFillOpacity = fillOpacity,
    stroke,
    strokeOpacity,
    z = maybeColorChannel(stroke)[0],
    clip, // optional additional clip for area
    tip,
    render,
    ...options
  } = {}
) {
  [x1, x2] = memoTuple(x, x1, x2);
  [y1, y2] = memoTuple(y, y1, y2);
  if (x1 === x2 && y1 === y2) {
    if (k === "y") y1 = memo(0);
    else x1 = memo(0);
  }
  ({tip} = withTip({tip}, k === "y" ? "x" : "y"));
  return marks(
    !isNoneish(positiveFill)
      ? Object.assign(
          area(data, {
            x1,
            x2,
            y1,
            y2,
            z,
            fill: positiveFill,
            fillOpacity: positiveFillOpacity,
            render: composeRender(render, clipDifference(k, true)),
            clip,
            ...options
          }),
          {ariaLabel: "positive difference"}
        )
      : null,
    !isNoneish(negativeFill)
      ? Object.assign(
          area(data, {
            x1,
            x2,
            y1,
            y2,
            z,
            fill: negativeFill,
            fillOpacity: negativeFillOpacity,
            render: composeRender(render, clipDifference(k, false)),
            clip,
            ...options
          }),
          {ariaLabel: "negative difference"}
        )
      : null,
    line(data, {
      x: x2,
      y: y2,
      z,
      stroke,
      strokeOpacity,
      tip,
      clip: true,
      ...options
    })
  );
}

function memoTuple(x, x1, x2) {
  if (x1 === undefined && x2 === undefined) {
    // {x} → [x, x]
    x1 = x2 = memo(x);
  } else if (x1 === undefined) {
    // {x2} → [x2, x2]
    // {x, x2} → [x, x2]
    x2 = memo(x2);
    x1 = x === undefined ? x2 : memo(x);
  } else if (x2 === undefined) {
    // {x1} → [x1, x1]
    // {x, x1} → [x1, x]
    x1 = memo(x1);
    x2 = x === undefined ? x1 : memo(x);
  } else {
    // {x1, x2} → [x1, x2]
    x1 = memo(x1);
    x2 = memo(x2);
  }
  return [x1, x2];
}

function memo(v) {
  let V;
  const {value, label = labelof(value)} = maybeValue(v);
  return {transform: (data) => V || (V = valueof(data, value)), label};
}

function clipDifference(k, positive) {
  const f = k === "x" ? "y" : "x"; // f is the flipped dimension
  const f1 = `${f}1`;
  const f2 = `${f}2`;
  const k1 = `${k}1`;
  const k2 = `${k}2`;
  return (index, scales, channels, dimensions, context, next) => {
    const {[f1]: F1, [f2]: F2} = channels;
    const K1 = new Float32Array(F1.length);
    const K2 = new Float32Array(F2.length);
    const m = dimensions[k === "y" ? "height" : "width"];
    (positive === inferScaleOrder(scales[k]) < 0 ? K1 : K2).fill(m);
    const oc = next(index, scales, {...channels, [f2]: F1, [k2]: K2}, dimensions, context);
    const og = next(index, scales, {...channels, [f1]: F2, [k1]: K1}, dimensions, context);
    const c = oc.querySelector("g") ?? oc; // applyClip
    const g = og.querySelector("g") ?? og; // applyClip
    for (let i = 0; c.firstChild; i += 2) {
      const id = getClipId();
      const clipPath = create("svg:clipPath", context).attr("id", id).node();
      clipPath.appendChild(c.firstChild);
      g.childNodes[i].setAttribute("clip-path", `url(#${id})`);
      g.insertBefore(clipPath, g.childNodes[i]);
    }
    return og;
  };
}
