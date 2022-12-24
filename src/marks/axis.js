import {inferFontVariant} from "../axes.js";
import {map, range, valueof, isNone, isNoneish} from "../options.js";
import {marks} from "../plot.js";
import {position, registry as scaleRegistry} from "../scales/index.js";
import {offset} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {textX, textY} from "./text.js";
import {vectorX, vectorY} from "./vector.js";

export function axisY({
  grid,
  gridOpacity = 0.1,
  color = "currentColor",
  opacity = 1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  fill = color,
  fillOpacity = opacity,
  frameAnchor = "left",
  lineAnchor = "middle",
  textAnchor = "end",
  tickSize = 6,
  tickPadding = 3,
  dx = 0,
  x,
  ...options
} = {}) {
  return marks(
    grid && !isNone(grid)
      ? gridY({
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dx,
          x1: x ?? null,
          x2: null,
          ...options
        })
      : null,
    tickSize !== 0 && !isNoneish(stroke)
      ? tick(vectorY, "y", {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          x,
          ...options,
          dx: +dx - offset,
          anchor: "start",
          length: tickSize,
          shape: shapeTickY,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? tick(
          textY,
          "y",
          {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, x, ...options, dx: +dx - tickSize - tickPadding},
          function (scales) {
            const {y} = scales;
            const {ticks} = options;
            this.fontVariant = inferFontVariant(y);
            this.channels.text.value = y.tickFormat(ticks);
          }
        )
      : null
  );
}

export function axisX({
  grid,
  gridOpacity = 0.1,
  color = "currentColor",
  opacity = 1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  fill = color,
  fillOpacity = opacity,
  frameAnchor = "bottom",
  lineAnchor = "top",
  textAnchor = "middle",
  tickSize = 6,
  tickPadding = 3,
  dy = 0,
  y,
  ...options
} = {}) {
  return marks(
    grid && !isNone(grid)
      ? gridX({
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dy,
          y1: null,
          y2: y ?? null,
          ...options
        })
      : null,
    tickSize !== 0 && !isNoneish(stroke)
      ? tick(vectorX, "x", {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          y,
          ...options,
          dy: +dy - offset,
          anchor: "start",
          length: tickSize,
          shape: shapeTickX,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? tick(
          textX,
          "x",
          {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, y, ...options, dy: +dy + +tickSize + +tickPadding},
          function (scales) {
            const {x} = scales;
            const {ticks} = options;
            this.fontVariant = inferFontVariant(x);
            this.channels.text.value = x.tickFormat(ticks);
          }
        )
      : null
  );
}

export function gridY({
  color = "currentColor",
  opacity = 0.1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  ...options
} = {}) {
  return tick(ruleY, "y", {stroke, strokeOpacity, strokeWidth, ...options});
}

export function gridX({
  color = "currentColor",
  opacity = 0.1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  ...options
} = {}) {
  return tick(ruleX, "x", {stroke, strokeOpacity, strokeWidth, ...options});
}

function tick(mark, k, options, initialize) {
  return mark(
    [],
    initializer(options, function (data, facets, channels, scales) {
      initialize?.call(this, scales);
      const {[k]: scale} = scales;
      const {ticks} = options;
      data = scale.ticks(ticks);
      facets = [range(data)];
      return {
        data,
        facets,
        channels: Object.fromEntries(
          Object.entries(this.channels).map(([name, channel]) => {
            const {scale} = channel;
            channel = {...channel, value: valueof(data, channel.value)};
            if (scaleRegistry.get(scale) === position) {
              channel.scale = null;
              channel.value = map(channel.value, scales[scale]);
            }
            return [name, channel];
          })
        )
      };
    })
  );
}

const shapeTickX = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, l);
  }
};

const shapeTickY = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(-l, 0);
  }
};
