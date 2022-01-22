import {brush as brusher, brushX as brusherX, brushY as brusherY, create, extent} from "d3";
import {identity, first, second} from "../options.js";
import {Mark} from "../plot.js";

const {max, min} = Math;

const defaults = {};

export class Brush extends Mark {
  constructor(data, {x = first, y = second, selection, ...options} = {}) {
    super(
      data,
      [
        {name: "picker", value: identity},
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.initialSelection = selection;
  }
  render(
    index,
    {x, y},
    {x: X, y: Y, picker: J},
    {marginLeft, width, marginRight, marginTop, height, marginBottom}
  ) {
    let root;
    const g = create("svg:g");
    const data = this.data;
    const bounds = [
      [Math.floor(marginLeft), Math.floor(marginTop)],
      [Math.ceil(width - marginRight), Math.ceil(height - marginBottom)]
    ];
    const brush = (X && Y ? brusher : X ? brusherX : brusherY)()
      .extent(bounds)
      .on("start brush end", (event) => {
        const {type, selection, sourceEvent} = event;
        if (selection) {
          if (X) {
            const [x0, x1] = Y ? [selection[0][0], selection[1][0]] : selection;
            index = index.filter(i => X[i] >= x0 && X[i] <= x1);
          }
          if (Y) {
            const [y0, y1] = X ? [selection[0][1], selection[1][1]] : selection;
            index = index.filter(i => Y[i] >= y0 && Y[i] <= y1);
          }
        }
        const dots = selection ? Array.from(index, i => J[i]) : data;

        if (root) {
          root.value = dots;
          root.dispatchEvent(new CustomEvent('input'));
          if (sourceEvent && type === "start") {
            for (const {b, g} of root.__brushes) {
              if (b !== brush) g.call(b.clear);
            }
          }
        }
      });

    g.call(brush);

    /* 🌶 async
     * wait for the ownerSVGElement to:
     * - send the first signal
     * - register the multiple brushes (for faceting)
     */
    setTimeout(() => {
      const svg = g.node().ownerSVGElement;
      root = svg.parentElement?.nodeName === "FIGURE" ? svg.parentElement : svg;
      if (!root.__brushes) root.__brushes = [];
      root.__brushes.push({b: brush, g});

      // initial setup works only on one facet
      if (root.__brushes.length === 1) {
        if (this.initialSelection) {
          const s = this.initialSelection;
          if (X && Y) {
            const [x0, x1] = extent([x(s[0][0]), x(s[1][0])]);
            const [y0, y1] = extent([y(s[0][1]), y(s[1][1])]);
            g.call(brush.move, [
              [ max(x0, bounds[0][0]), max(y0, bounds[0][1]) ],
              [ min(x1, bounds[1][0]), min(y1, bounds[1][1]) ]
            ]);
          } else if (X) {
            const [x0, x1] = extent(s.map(x));
            g.call(brush.move, [ max(x0, bounds[0][0]), min(x1, bounds[1][0]) ]);
          } else if (Y) {
            const [y0, y1] = extent(s.map(y));
            g.call(brush.move, [ max(y0, bounds[0][1]), min(y1, bounds[1][1]) ]);
          }
        } else {
          g.call(brush.clear);
        }
      }
    }, 1);

    return g.node();
  }
}

export function brush(data, options) {
  return new Brush(data, options);
}

export function brushX(data, {x = identity, ...options} = {}) {
  return new Brush(data, {...options, x, y: null});
}

export function brushY(data, {y = identity, ...options} = {}) {
  return new Brush(data, {...options, x: null, y});
}
