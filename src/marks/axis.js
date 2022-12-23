import {inferFontVariant} from "../axes.js";
import {range, valueof} from "../options.js";
import {marks} from "../plot.js";
import {position, registry as scaleRegistry} from "../scales/index.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {textX, textY} from "./text.js";

export function axisY({
  color,
  opacity,
  stroke = color,
  strokeOpacity = opacity,
  fill = color,
  fillOpacity = opacity,
  ticks,
  ...options
} = {}) {
  return marks(
    ruleY(
      [],
      initializer({stroke, strokeOpacity, ...options}, function (data, facets, channels, scales, dimensions) {
        const {y} = scales;
        data = y.ticks(ticks);
        facets = [range(data)];
        this.insetLeft = -6;
        this.insetRight = dimensions.width - dimensions.marginLeft - dimensions.marginRight;
        return {data, facets, channels: {y: {value: data.map(y)}, ...rechannel(this, data)}};
      })
    ),
    textY(
      [],
      initializer({fill, fillOpacity, ...options}, function (data, facets, channels, scales) {
        const {y} = scales;
        data = y.ticks(ticks);
        facets = [range(data)];
        this.fontVariant = inferFontVariant(y);
        this.frameAnchor = "left";
        this.textAnchor = "end";
        this.channels.text.value = y.tickFormat(ticks);
        this.dx = -9;
        return {data, facets, channels: {y: {value: data.map(y)}, ...rechannel(this, data)}};
      })
    )
  );
}

export function axisX({
  color,
  opacity,
  stroke = color,
  strokeOpacity = opacity,
  fill = color,
  fillOpacity = opacity,
  ticks,
  ...options
} = {}) {
  return marks(
    ruleX(
      [],
      initializer({stroke, strokeOpacity, ...options}, function (data, facets, channels, scales, dimensions) {
        const {x} = scales;
        data = x.ticks(ticks);
        facets = [range(data)];
        this.insetBottom = -6;
        this.insetTop = dimensions.height - dimensions.marginTop - dimensions.marginBottom;
        return {data, facets, channels: {x: {value: data.map(x)}, ...rechannel(this, data)}};
      })
    ),
    textX(
      [],
      initializer({fill, fillOpacity, ...options}, function (data, facets, channels, scales) {
        const {x} = scales;
        data = x.ticks(ticks);
        facets = [range(data)];
        this.fontVariant = inferFontVariant(x);
        this.frameAnchor = "bottom";
        this.lineAnchor = "top";
        this.dy = 9;
        this.channels.text.value = x.tickFormat(ticks);
        return {data, facets, channels: {x: {value: data.map(x)}, ...rechannel(this, data)}};
      })
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
