import {pathRound as path, symbolCircle} from "d3";
import {create} from "../context.js";
import {negative, positive} from "../defined.js";
import {Mark} from "../mark.js";
import {identity, maybeFrameAnchor, maybeNumberChannel, maybeTuple} from "../options.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform
} from "../style.js";
import {maybeSymbolChannel} from "../symbol.js";
import {template} from "../template.js";
import {sort} from "../transforms/basic.js";
import {maybeIntervalMidX, maybeIntervalMidY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "dot",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export function withDefaultSort(options) {
  return options.sort === undefined && options.reverse === undefined ? sort({channel: "-r"}, options) : options;
}

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, rotate, symbol = symbolCircle, frameAnchor} = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vsymbol, csymbol] = maybeSymbolChannel(symbol);
    const [vr, cr] = maybeNumberChannel(r, vsymbol == null ? 3 : 4.5);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        r: {value: vr, scale: "r", filter: positive, optional: true},
        rotate: {value: vrotate, optional: true},
        symbol: {value: vsymbol, scale: "auto", optional: true}
      },
      withDefaultSort(options),
      defaults
    );
    this.r = cr;
    this.rotate = crotate;
    this.symbol = csymbol;
    this.frameAnchor = maybeFrameAnchor(frameAnchor);

    // Give a hint to the symbol scale; this allows the symbol scale to choose
    // appropriate default symbols based on whether the dots are filled or
    // stroked, and for the symbol legend to match the appearance of the dots.
    const {channels} = this;
    const {symbol: symbolChannel} = channels;
    if (symbolChannel) {
      const {fill: fillChannel, stroke: strokeChannel} = channels;
      symbolChannel.hint = {
        fill: fillChannel
          ? fillChannel.value === symbolChannel.value
            ? "color"
            : "currentColor"
          : this.fill ?? "currentColor",
        stroke: strokeChannel
          ? strokeChannel.value === symbolChannel.value
            ? "color"
            : "currentColor"
          : this.stroke ?? "none"
      };
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, r: R, rotate: A, symbol: S} = channels;
    const {r, rotate, symbol} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const circle = symbol === symbolCircle;
    const size = R ? undefined : r * r * Math.PI;
    if (negative(r)) index = [];
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append(circle ? "circle" : "path")
          .call(applyDirectStyles, this)
          .call(
            circle
              ? (selection) => {
                  selection
                    .attr("cx", X ? (i) => X[i] : cx)
                    .attr("cy", Y ? (i) => Y[i] : cy)
                    .attr("r", R ? (i) => R[i] : r);
                }
              : (selection) => {
                  selection
                    .attr(
                      "transform",
                      template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${
                        A ? (i) => ` rotate(${A[i]})` : rotate ? ` rotate(${rotate})` : ``
                      }`
                    )
                    .attr(
                      "d",
                      R && S
                        ? (i) => {
                            const p = path();
                            S[i].draw(p, R[i] * R[i] * Math.PI);
                            return p;
                          }
                        : R
                        ? (i) => {
                            const p = path();
                            symbol.draw(p, R[i] * R[i] * Math.PI);
                            return p;
                          }
                        : S
                        ? (i) => {
                            const p = path();
                            S[i].draw(p, size);
                            return p;
                          }
                        : (() => {
                            const p = path();
                            symbol.draw(p, size);
                            return p;
                          })()
                    );
                }
          )
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

export function dot(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, maybeIntervalMidY({...options, x}));
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, maybeIntervalMidX({...options, y}));
}

export function circle(data, options) {
  return dot(data, {...options, symbol: "circle"});
}

export function hexagon(data, options) {
  return dot(data, {...options, symbol: "hexagon"});
}
