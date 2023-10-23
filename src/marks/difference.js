import {area as shapeArea} from "d3";
import {create} from "../context.js";
import {identity, indexOf, column, valueof} from "../options.js";
import {basic as transform} from "../transforms/basic.js";
import {groupIndex, getClipId} from "../style.js";
import {marks} from "../mark.js";
import {area} from "./area.js";
import {lineY} from "./line.js";

function renderArea(X, Y, y0, {curve}) {
  return shapeArea()
    .curve(curve)
    .defined((i) => i >= 0) // TODO: ??
    .x((i) => X[i])
    .y1((i) => Y[i])
    .y0(y0);
}

export function differenceY(
  data,
  {
    x = indexOf,
    x1 = x,
    x2 = x,
    y = identity,
    y1 = y,
    y2 = y,
    positiveColor = "#01ab63",
    negativeColor = "#4269d0",
    opacity = 1,
    positiveOpacity = opacity,
    negativeOpacity = opacity,
    ariaLabel = "difference",
    positiveAriaLabel = `positive ${ariaLabel}`,
    negativeAriaLabel = `negative ${ariaLabel}`,
    stroke,
    strokeOpacity,
    tip,
    channels,
    ...options
  } = {}
) {
  // The positive area goes from the top (0) down to the reference value y2, and
  // is clipped by an area going from y1 to the top (0). It computes the
  // channels which are then reused by the negative area and the line.
  const areaPositive = area(
    data,
    maybeDifferenceChannelsY({
      x1,
      x2,
      y1,
      y2,
      fill: positiveColor,
      fillOpacity: positiveOpacity,
      ...options,
      tip,
      // todo render
      render: function (index, scales, channels, dimensions, context, next) {
        const wrapper = create("svg:g", context);
        const clip = getClipId();
        const {x1: X1, y1: Y1, x2: X2 = X1} = channels;
        const {height} = dimensions;
        wrapper
          .append("clipPath")
          .attr("id", clip)
          .selectAll()
          .data(groupIndex(index, [X1, Y1], this, channels))
          .enter()
          .append("path")
          .attr("d", renderArea(X1, Y1, height, this));
        const g = next(index, scales, {...channels, x1: X2, y1: new Float32Array(Y1.length)}, dimensions, context);
        g.setAttribute("clip-path", `url(#${clip})`);
        g.removeAttribute("aria-label");
        wrapper.attr("aria-label", positiveAriaLabel);
        wrapper.append(() => g);
        return wrapper.node();
      }
    })
  );

  return marks(
    areaPositive,

    // The negative area goes from the bottom (height) up to the reference value
    // y2, and is clipped by an area going from y1 to the top (0).
    area(data, {
      x1: [],
      x2: [],
      y1: [],
      y2: [],
      fill: negativeColor,
      fillOpacity: negativeOpacity,
      ...options,
      render: function (index, scales, channels, dimensions, context, next) {
        const wrapper = create("svg:g", context);
        const clip = getClipId();
        const {values} = context.getMarkState(areaPositive);
        const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2} = values;
        const {height} = dimensions;
        wrapper
          .append("clipPath")
          .attr("id", clip)
          .selectAll()
          .data(groupIndex(index, [X1, Y1], this, channels))
          .enter()
          .append("path")
          .attr("d", renderArea(X1, Y1, 0, this));
        const g = next(
          index,
          scales,
          {...channels, x1: X2, y1: new Float32Array(Y1.length).fill(height), x2: X2, y2: Y2},
          dimensions,
          context
        );
        g.setAttribute("clip-path", `url(#${clip})`);
        wrapper.append(() => g);
        g.removeAttribute("aria-label");
        wrapper.attr("aria-label", negativeAriaLabel);
        return wrapper.node();
      }
    }),

    // reference line
    lineY(data, {
      x: [],
      y: [],
      render: function (index, scales, channels, dimensions, context, next) {
        const {values} = context.getMarkState(areaPositive);
        const {x1: X1, y1: Y1} = values;
        return next(index, scales, {...channels, x: X1, y: Y1}, dimensions, context);
      },
      stroke,
      strokeOpacity,
      ...options
    })
  );
}

// Adds the difference channels for the default tip mark. Materializes
// x1, y1 and y2.
function maybeDifferenceChannelsY({x1, y1, y2, ...options}) {
  if (!options.tip) return {x1, y1, y2, ...options};
  const [X1, setX] = column(x1);
  const [Y1, setY1] = column(y1);
  const [Y2, setY2] = column(y2);
  const [D, setD] = column();
  options = transform(options, function (data, facets) {
    setX(valueof(data, x1));
    const Y1 = setY1(valueof(data, y1));
    const Y2 = setY2(valueof(data, y2));
    setD(Float64Array.from(Y1, (y1, i) => y1 - Y2[i]));
    return {data, facets};
  });
  return {x1: X1, y1: Y1, y2: Y2, channels: {x: X1, y1: true, y2: true, difference: D}, ...options};
}
