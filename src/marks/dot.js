import {create, path, symbolCircle} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, identity, maybeNumber, maybeTuple} from "../mark.js";
import {maybeSymbol} from "../scales/symbol.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, rotate, symbol} = options;
    const [vr, cr] = maybeNumber(r, 3);
    const [vrotate, crotate] = maybeNumber(rotate, 0);
    const [vsymbol, csymbol] = maybeSymbol(symbol);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "rotate", value: vrotate, optional: true},
        {name: "symbol", value: vsymbol, scale: "symbol", optional: true}
      ],
      options,
      defaults
    );
    this.r = cr;
    this.rotate = crotate;
    this.symbol = csymbol;
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, r: R, rotate: A, symbol: S} = channels;
    const {dx, dy} = this;
    let index = filter(I, X, Y, S);
    if (R) index = index.filter(i => positive(R[i]));
    const circle = this.symbol === symbolCircle;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join(circle ? "circle" : "path")
            .call(applyDirectStyles, this)
            .call(circle
              ? selection => {
                selection
                    .attr("cx", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
                    .attr("cy", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
                    .attr("r", R ? i => R[i] : this.r);
              }
              : selection => {
                // TODO optimize these accessors to avoid them if needed
                const fx = X ? i => X[i] : () => (marginLeft + width - marginRight) / 2;
                const fy = Y ? i => Y[i] : () => (marginTop + height - marginBottom) / 2;
                const fr = R ? i => R[i] : () => this.r;
                const fs = S ? i => S[i] : () => this.symbol;
                selection
                    .attr("transform", A ? i => `translate(${fx(i)},${fy(i)}) rotate(${A[i]})`
                      : this.rotate ? i => `translate(${fx(i)},${fy(i)}) rotate(${this.rotate})`
                      : i => `translate(${fx(i)},${fy(i)})`)
                    .attr("d", i => {
                      const p = path(), r = fr(i);
                      fs(i).draw(p, r * r * Math.PI);
                      return p;
                    });
              })
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function dot(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, y});
}
