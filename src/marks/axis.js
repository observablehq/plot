import {inferFontVariant} from "../axes.js";
import {range} from "../options.js";
import {marks} from "../plot.js";
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
      initializer({stroke, strokeOpacity, ...options}, function (data, facets, channels, {y}, dimensions) {
        const Y = y.ticks(ticks);
        this.insetLeft = -6;
        this.insetRight = dimensions.width - dimensions.marginLeft - dimensions.marginRight;
        return {data: Y, facets: [range(Y)], channels: {y: {value: Y.map(y)}}};
      })
    ),
    textY(
      [],
      initializer({fill, fillOpacity, ...options}, function (data, facets, channels, {y}) {
        const Y = y.ticks(ticks);
        this.fontVariant = inferFontVariant(y);
        this.frameAnchor = "left";
        this.textAnchor = "end";
        this.dx = -9;
        return {
          data: Y,
          facets: [range(Y)],
          channels: {y: {value: Y.map(y)}, text: {value: Y.map(y.tickFormat(ticks))}}
        };
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
      initializer({stroke, strokeOpacity, ...options}, function (data, facets, channels, {x}, dimensions) {
        const X = x.ticks(ticks);
        this.insetBottom = -6;
        this.insetTop = dimensions.height - dimensions.marginTop - dimensions.marginBottom;
        return {data: X, facets: [range(X)], channels: {x: {value: X.map(x)}}};
      })
    ),
    textX(
      [],
      initializer({fill, fillOpacity, ...options}, function (data, facets, channels, {x}) {
        const X = x.ticks(ticks);
        this.fontVariant = inferFontVariant(x);
        this.frameAnchor = "bottom";
        this.lineAnchor = "top";
        this.dy = 9;
        return {
          data: X,
          facets: [range(X)],
          channels: {x: {value: X.map(x)}, text: {value: X.map(x.tickFormat(ticks))}}
        };
      })
    )
  );
}
