import {brush as brusher, brushX as brusherX, brushY as brusherY, create} from "d3";
import {Mark, identity, first, second} from "../mark.js";

const defaults = {};
export class Brush extends Mark {
  constructor(data, {x = first, y = second, quiet = false, selection, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true}
      ],
      {...options, selection: true},
      defaults
    );
    this.initialSelection = selection;
    this.quiet = !!quiet;
    this.brushes = [];
  }
  render(
    I,
    scales,
    {x: X, y: Y},
    {marginLeft, width, marginRight, marginTop, height, marginBottom}
  ) {
    const bounds = [
      [Math.floor(marginLeft), Math.floor(marginTop)],
      [Math.ceil(width - marginRight), Math.ceil(height - marginBottom)]
    ];
    const F = new Uint8Array(X ? X.length : Y.length);
    const {brushes, quiet} = this;
    const origin = brushes.length;
    for (const i of I) F[i] = 1;
    const {onchange} = this;
    const brush = (X && Y ? brusher : X ? brusherX : brusherY)()
      .extent(bounds)
      .on("start brush end", (event) => {
        const {selection, sourceEvent} = event;
        if (sourceEvent === undefined) return; // a programmatic selection clears all the brushes
        if (!selection) {
          onchange({detail: {filter: quiet, origin}});
        } else {
          let x0, x1, y0, y1;
          if (X) ([x0, x1] = Y ? [selection[0][0], selection[1][0]] : selection);
          if (Y) ([y0, y1] = X ? [selection[0][1], selection[1][1]] : selection);
          onchange({detail: {
            filter: X && Y ? (d, i) => F[i] && X[i] >= x0 && X[i] <= x1 && Y[i] >= y0 && Y[i] <= y1
              : X ? (d, i) => F[i] && X[i] >= x0 && X[i] <= x1
              : (d, i) => F[i] && Y[i] >= y0 && Y[i] <= y1,
            origin
          }});
        }
      });
      const g = create("svg:g").call(brush);
      brushes.push(() => g.call(brush.clear));
      return g.node();
  }
  select(event, {origin}) {
    this.brushes.forEach((clear, i) => i !== origin && clear());
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
