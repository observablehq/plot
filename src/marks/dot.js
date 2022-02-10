import {create, path, symbolCircle} from "d3";
import {positive} from "../defined.js";
import {identity, maybeFrameAnchor, maybeNumberChannel, maybeSymbolChannel, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  ariaLabel: "dot",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, rotate, symbol = symbolCircle, frameAnchor} = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vsymbol, csymbol] = maybeSymbolChannel(symbol);
    const [vr, cr] = maybeNumberChannel(r, vsymbol == null ? 3 : 4.5);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "r", value: vr, scale: "r", filter: positive, optional: true},
        {name: "rotate", value: vrotate, optional: true},
        {name: "symbol", value: vsymbol, scale: "symbol", optional: true}
      ],
      options,
      defaults
    );
    this.r = cr;
    this.rotate = crotate;
    this.symbol = csymbol;
    this.frameAnchor = maybeFrameAnchor(frameAnchor);

    // Give a hint to the symbol scale; this allows the symbol scale to chose
    // appropriate default symbols based on whether the dots are filled or
    // stroked, and for the symbol legend to match the appearance of the dots.
    const {channels} = this;
    const symbolChannel = channels.find(({scale}) => scale === "symbol");
    if (symbolChannel) {
      const fillChannel = channels.find(({name}) => name === "fill");
      const strokeChannel = channels.find(({name}) => name === "stroke");
      symbolChannel.hint = {
        fill: fillChannel ? (fillChannel.value === symbolChannel.value ? "color" : "currentColor") : this.fill,
        stroke: strokeChannel ? (strokeChannel.value === symbolChannel.value ? "color" : "currentColor") : this.stroke
      };
    }
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, r: R, rotate: A, symbol: S} = channels;
    const {dx, dy} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const circle = this.symbol === symbolCircle;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join(circle ? "circle" : "path")
            .call(applyDirectStyles, this)
            .call(circle
              ? selection => {
                selection
                    .attr("cx", X ? i => X[i] : cx)
                    .attr("cy", Y ? i => Y[i] : cy)
                    .attr("r", R ? i => R[i] : this.r);
              }
              : selection => {
                const translate = X && Y ? i => `translate(${X[i]},${Y[i]})`
                  : X ? i => `translate(${X[i]},${cy})`
                  : Y ? i => `translate(${cx},${Y[i]})`
                  : () => `translate(${cx},${cy})`;
                selection
                    .attr("transform", A ? i => `${translate(i)} rotate(${A[i]})`
                      : this.rotate ? i => `${translate(i)} rotate(${this.rotate})`
                      : translate)
                    .attr("d", i => {
                      const p = path(), r = R ? R[i] : this.r;
                      (S ? S[i] : this.symbol).draw(p, r * r * Math.PI);
                      return p;
                    });
              })
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function dot(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, y});
}
