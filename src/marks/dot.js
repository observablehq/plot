import {path, select, symbolCircle} from "d3";
import {create} from "../context.js";
import {positive} from "../defined.js";
import {identity, maybeFrameAnchor, maybeNumberChannel, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {applyAttr, applyChannelStyles, applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform} from "../style.js";
import {maybeSymbolChannel} from "../symbols.js";
import {sort} from "../transforms/basic.js";
import {maybeIntervalMidX, maybeIntervalMidY} from "../transforms/interval.js";

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
      options.sort === undefined && options.reverse === undefined ? sort({channel: "r", order: "descending"}, options) : options,
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
    const {symbol: symbolChannel} = channels;
    if (symbolChannel) {
      const {fill: fillChannel, stroke: strokeChannel} = channels;
      symbolChannel.hint = {
        fill: fillChannel ? (fillChannel.value === symbolChannel.value ? "color" : "currentColor") : this.fill,
        stroke: strokeChannel ? (strokeChannel.value === symbolChannel.value ? "color" : "currentColor") : this.stroke
      };
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, r: R, rotate: A, symbol: S} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const circle = this.symbol === symbolCircle;
    return create("svg:g", context)
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, scales)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append(circle ? "circle" : "path")
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
  // TODO Support symbols.
  // TODO Support other things being changed besides x and y channels.
  // TODO Memoize the selection for faster updates?
  // TODO Access to old channels as well as new channels.
  renderUpdate(g, index, scales, channels) {
    const {x: X, y: Y} = channels;
    select(g).selectChildren()
        .call(applyAttr, "cx", X && (i => X[i]))
        .call(applyAttr, "cy", Y && (i => Y[i]));
  }
  renderAnimation(g, index, scales, channels, timing) {
    const {x: X, y: Y} = channels;
    const finishes = [];
    const mark = this;
    select(g).selectChildren().each(function(i) {
      const animation = this.animate(
        [{cx: X ? X[i] : undefined, cy: Y ? Y[i] : undefined}],
        // TODO Should this be mark.data here (which is not arrayify’d), or
        // should it be the transformed data that is in stateByMark, which would
        // need to be passed-in to this function, perhaps as a “data” channel?
        typeof timing === "function" ? timing(mark.data[i], i) : timing
      );
      // Per the spec: “Authors are discouraged from using fill modes to produce
      // animations whose effect is applied indefinitely… [Fill modes] produce
      // situations where animation state would be accumulated indefinitely
      // necessitating the automatic removal of animations defined in §5.5
      // Replacing animations. Furthermore, indefinitely filling animations can
      // cause changes to specified style to be ineffective long after all
      // animations have completed since the animation style takes precedence in
      // the CSS cascade [css-cascade-3].”
      // https://drafts.csswg.org/web-animations-1/#example-515a2006
      finishes.push(animation.finished.then(() => {
        if (X) this.setAttribute("cx", X[i]);
        if (Y) this.setAttribute("cy", Y[i]);
      }));
    });
    return Promise.all(finishes);
  }
}

export function dot(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
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
