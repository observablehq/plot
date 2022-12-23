import {inferFontVariant} from "../axes.js";
import {map, range, valueof} from "../options.js";
import {marks} from "../plot.js";
import {position, registry as scaleRegistry} from "../scales/index.js";
import {initializer} from "../transforms/basic.js";
import {vectorX, vectorY} from "./vector.js";
import {textX, textY} from "./text.js";

export function axisY({
  color,
  opacity,
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
  ...options
} = {}) {
  return marks(
    vectorY(
      [],
      initializer(
        {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          anchor: "start",
          shape: shapeTickY,
          length: tickSize,
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
              ...(channels.x && {x: {value: map(valueof(data, this.channels.x.value), x)}}),
              ...rechannel(this, data)
            }
          };
        }
      )
    ),
    textY(
      [],
      initializer(
        {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, ...options},
        function (data, facets, channels, scales) {
          const {x, y} = scales;
          data = y.ticks(ticks);
          facets = [range(data)];
          this.fontVariant = inferFontVariant(y);
          this.channels.text.value = y.tickFormat(ticks);
          this.dx = -9;
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
  );
}

export function axisX({
  color,
  opacity,
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
  ...options
} = {}) {
  return marks(
    vectorX(
      [],
      initializer(
        {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          anchor: "start",
          length: tickSize,
          shape: shapeTickX,
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
              ...(channels.y && {y: {value: map(valueof(data, this.channels.y.value), y)}}),
              ...rechannel(this, data)
            }
          };
        }
      )
    ),
    textX(
      [],
      initializer(
        {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, ...options},
        function (data, facets, channels, scales) {
          const {x, y} = scales;
          data = x.ticks(ticks);
          facets = [range(data)];
          this.fontVariant = inferFontVariant(x);
          this.dy = 9;
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
