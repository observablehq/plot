import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, nonempty, positive} from "../defined.js";
import {Mark, indexOf, identity, first, second, maybeColor, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyBandTransform} from "../style.js";

export class Symbolic extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      size,
      title,
      fill,
      stroke,
      symbol,
      transform,
      ...style
    } = {}
  ) {
    const [vsize, csize = vsize == null ? 27 : undefined] = maybeNumber(size);
    const [vfill, cfill = vfill == null ? "none" : undefined] = maybeColor(fill);
    const [vstroke, cstroke = vstroke == null && cfill === "none" ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "size", value: vsize, scale: "size", optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "symbol", value: symbol, optional: true}
      ],
      transform
    );
    this.size = csize;
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke != null || vstroke != null ? 1.5 : undefined,
      ...style
    });
  }
  render(
    I,
    {x, y, size, color},
    {x: X, y: Y, z: Z, size: A, title: L, fill: F, stroke: S, symbol: K}
  ) {
    let index = filter(I, X, Y, F, S);
    if (A) index = index.filter(i => positive(A[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    const table = new symbolTable();
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyBandTransform, x, y)
        .call(g => g.selectAll()
          .data(index)
          .join("use")
            .call(applyDirectStyles, this)
            .attr("transform", i => `translate(${x(X[i])},${y(Y[i])})scale(${scale(A ? size(A[i]) : this.size)})`)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .attr("href", K ? (i => table.get(K[i])) : table.get("rect"))
            .call(L ? text => text
              .filter(i => nonempty(L[i]))
              .append("title")
              .text(i => L[i]) : () => {})
        )
        .call(g => g.append("defs")
          .selectAll()
          .data(table.symbols())
          .join("g")
          .attr("id", ({id}) => id)
          .html(({src}) => src)
          .selectAll("*")
            .attr("vector-effect", "non-scaling-stroke")
        )
      .node();
  }
}

class symbolTable {
  constructor() {
    this.s = new Map();
    this.uniq = `A${Math.floor(Math.random() * 1e7)}`;
  }
  symbols() {
    return this.s.values();
  }
  add(name, src) {
    this.s.set(name, {src, id: this.uniq + name});
  }
  get(name) {
    if (!this.s.has(name)) {
      switch (name) {
        case "rect":
          this.add(name, "<rect width=2 height=2 x=-1 y=-1>");
          break;
        case "dot":
        default:
          this.add(name, "<circle r=1>");
          break;
      }
    }
    return `#${this.s.get(name).id}`;
  }
}

function scale(area) {
  return Math.sqrt(area / 3);
}

export function symbol(data, options) {
  return new Symbolic(data, options);
}

export function symbolX(data, {x = identity, ...options} = {}) {
  return new Symbolic(data, {...options, x, y: indexOf});
}

export function symbolY(data, {y = identity, ...options} = {}) {
  return new Symbolic(data, {...options, x: indexOf, y});
}
