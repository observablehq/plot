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
  ticks,
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
          ticks,
          dx,
          x1: x ?? null,
          x2: null,
          ...options
        })
      : null,
    tickSize !== 0 && !isNoneish(stroke)
      ? vectorY(
          [],
          initializer(
            {
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
            },
            function (data, facets, channels, scales) {
              const {x, y} = scales;
              data = y.ticks(ticks);
              facets = [range(data)];
              return {
                data,
                facets,
                channels: {
                  y: {value: data.map(y)},
                  ...(channels.x && {x: {value: map(valueof(data, this.channels.x.value), x)}}),
                  ...rechannel(this, data)
                }
              };
            }
          )
        )
      : null,
    !isNoneish(fill)
      ? textY(
          [],
          initializer(
            {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, x, ...options, dx: +dx - tickSize - tickPadding},
            function (data, facets, channels, scales) {
              const {x, y} = scales;
              data = y.ticks(ticks);
              facets = [range(data)];
              this.fontVariant = inferFontVariant(y);
              this.channels.text.value = y.tickFormat(ticks);
              return {
                data,
                facets,
                channels: {
                  y: {value: data.map(y)},
                  ...(channels.x && {x: {value: map(valueof(data, this.channels.x.value), x)}}),
                  ...rechannel(this, data)
                }
              };
            }
          )
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
  ticks,
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
          ticks,
          dy,
          y1: null,
          y2: y ?? null,
          ...options
        })
      : null,
    tickSize !== 0 && !isNoneish(stroke)
      ? vectorX(
          [],
          initializer(
            {
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
            },
            function (data, facets, channels, scales) {
              const {x, y} = scales;
              data = x.ticks(ticks);
              facets = [range(data)];
              return {
                data,
                facets,
                channels: {
                  x: {value: data.map(x)},
                  ...(channels.y && {y: {value: map(valueof(data, this.channels.y.value), y)}}),
                  ...rechannel(this, data)
                }
              };
            }
          )
        )
      : null,
    !isNoneish(fill)
      ? textX(
          [],
          initializer(
            {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, y, ...options, dy: +dy + +tickSize + +tickPadding},
            function (data, facets, channels, scales) {
              const {x, y} = scales;
              data = x.ticks(ticks);
              facets = [range(data)];
              this.fontVariant = inferFontVariant(x);
              this.channels.text.value = x.tickFormat(ticks);
              return {
                data,
                facets,
                channels: {
                  x: {value: data.map(x)},
                  ...(channels.y && {y: {value: map(valueof(data, this.channels.y.value), y)}}),
                  ...rechannel(this, data)
                }
              };
            }
          )
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
  ticks,
  ...options
} = {}) {
  return ruleY(
    [],
    initializer(
      {
        stroke,
        strokeOpacity,
        strokeWidth,
        ...options
      },
      function (data, facets, channels, scales) {
        const {x, y} = scales;
        data = y.ticks(ticks);
        facets = [range(data)];
        return {
          data,
          facets,
          channels: {
            y: {value: data.map(y)},
            ...(channels.x1 && {x1: {value: map(valueof(data, this.channels.x1.value), x)}}),
            ...(channels.x2 && {x2: {value: map(valueof(data, this.channels.x2.value), x)}}),
            ...rechannel(this, data)
          }
        };
      }
    )
  );
}

export function gridX({
  color = "currentColor",
  opacity = 0.11,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  ticks,
  ...options
} = {}) {
  return ruleX(
    [],
    initializer(
      {
        stroke,
        strokeOpacity,
        strokeWidth,
        ...options
      },
      function (data, facets, channels, scales) {
        const {x, y} = scales;
        data = x.ticks(ticks);
        facets = [range(data)];
        return {
          data,
          facets,
          channels: {
            x: {value: data.map(x)},
            ...(channels.y1 && {y1: {value: map(valueof(data, this.channels.y1.value), y)}}),
            ...(channels.y2 && {y2: {value: map(valueof(data, this.channels.y2.value), y)}}),
            ...rechannel(this, data)
          }
        };
      }
    )
  );
}

function rechannel(mark, data) {
  return Object.fromEntries(
    Object.entries(mark.channels)
      .filter(([, {scale}]) => scaleRegistry.get(scale) !== position)
      .map(([name, channel]) => [name, {...channel, value: valueof(data, channel.value)}])
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
