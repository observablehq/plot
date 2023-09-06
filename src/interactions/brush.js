import {ascending, transpose, select} from "d3";
import {brush as brusher, brushX as brusherX, brushY as brusherY} from "d3";
import {take} from "../options.js";

const states = new WeakMap();

function brushTransform(mode, {selected = {}, unselected = {}, padding = 1, ...options}) {
  if (typeof padding !== "number") throw new Error(`invalid brush padding: ${padding}`);
  return {
    ...options,
    creator() {
      const s = (this.selected = new this.constructor(this.data, {...options, ...selected}));
      const u = (this.unselected = new this.constructor(this.data, {...options, ...unselected}));
      for (const c in selected) if (c in s.channels) this.channels[`selected:${c}`] = s.channels[c];
      for (const c in unselected) if (c in u.channels) this.channels[`unselected:${c}`] = u.channels[c];
    },
    render: function (index, scales, values, dimensions, context, next) {
      const s = this.selected;
      const u = this.unselected;
      const svalues = {...values};
      const uvalues = {...values};
      for (const c in selected) svalues[c] = c in s.channels ? values[`selected:${c}`] : null;
      for (const c in unselected) uvalues[c] = c in u.channels ? values[`unselected:${c}`] : null;
      const g = next(index, scales, values, dimensions, context);
      const {data} = context.getMarkState(this); // TODO: data might be attached to values in the future(?)

      const svg = context.ownerSVGElement;
      function createBrush() {
        // Isolate state per-plot.
        let state = states.get(svg);
        const transform = g.getAttribute("transform");
        if (state) {
          if (!index.fi) throw new Error("The brush interaction currently supports only one brush per plot.");
        } else {
          // Derive intersection bounds.
          const {x, y} = scales.scales;
          const bx = x?.bandwidth ?? 0;
          const by = y?.bandwidth ?? 0;
          const {x: X, x1: X1, x2: X2, y: Y, y1: Y1, y2: Y2} = values;
          const Xl = X1 && X2 ? X1.map((d, i) => Math.min(d, X2[i])) : X;
          const Xm = X1 && X2 ? X1.map((d, i) => Math.max(d, X2[i]) + bx) : bx ? X.map((d) => d + bx) : X;
          const Yl = Y1 && Y2 ? Y1.map((d, i) => Math.min(d, Y2[i])) : Y;
          const Ym = Y1 && Y2 ? Y1.map((d, i) => Math.max(d, Y2[i]) + by) : by ? Y.map((d) => d + by) : Y;

          // This brush is shared by all the facets.
          const {width, height, marginLeft, marginTop, marginRight, marginBottom} = dimensions;
          const extent = [
            [marginLeft - padding, marginTop - padding],
            [width - marginRight + padding, height - marginBottom + padding]
          ];
          const brush = (mode === "xy" ? brusher : mode === "x" ? brusherX : brusherY)()
            .extent(extent)
            .on("start brush end", function ({type, selection, sourceEvent}, fi) {
              const b = state.brushState[fi];
              const {index, transform, g} = b;
              const [X, Y] = !selection
                ? []
                : mode === "xy"
                ? transpose(selection)
                : mode === "x"
                ? [selection]
                : [, selection];

              const S = [];
              const U = [];
              for (const i of index) {
                [U, S][+((!X || (X[0] < Xm[i] && Xl[i] < X[1])) && (!Y || (Y[0] < Ym[i] && Yl[i] < Y[1])))].push(i);
              }
              if (!b.ug) {
                g.replaceWith((b.sg = document.createComment("selected")));
                b.sg.parentNode.insertBefore((b.ug = document.createComment("unselected")), b.sg);
              }
              b.ug.replaceWith((b.ug = u.render(U, scales, uvalues, dimensions, context)));
              b.sg.replaceWith((b.sg = s.render(S, scales, svalues, dimensions, context)));
              if (transform) {
                b.ug.setAttribute("transform", transform);
                b.sg.setAttribute("transform", transform);
              }

              switch (type) {
                // Only one facet can be active at a time; clear and unselect the others.
                case "start":
                  if (sourceEvent && sourceEvent.type !== "empty")
                    for (const {i, empty} of state.brushState) if (i !== fi) empty();
                  break;
                case "end":
                  if (selection === null) {
                    b.sg.replaceWith(g);
                    b.ug.remove();
                    b.sg = null;
                    b.ug = null;
                    if (sourceEvent) for (const {i, reset} of state.brushState) if (i !== fi) reset();
                  }
                  break;
              }

              // Update the plot’s value.
              const value = selection === null ? data : take(data, S);
              if (selection !== null) {
                if (X) addBrushDomain("x", x, X, value);
                if (Y) addBrushDomain("y", y, Y, value);
                if ("fx" in scales) value.fx = index.fx;
                if ("fy" in scales) value.fy = index.fy;
                value.done = type === "end";
              }
              context.dispatchValue(value);
            });
          states.set(svg, (state = {brush, brushState: [], selection: null}));
        }
        const {brush, brushState} = state;
        const fi = index.fi ?? 0;
        const target = select(g.parentElement).append("g").attr("transform", transform).datum(fi).call(brush);
        brushState[fi] = {
          i: fi,
          index,
          transform,
          g,
          reset() {
            target.call(brush.move, null);
          },
          empty() {
            target.call(
              brush.move,
              mode === "xy"
                ? [
                    [0, 0],
                    [0, 0]
                  ]
                : [0, 0]
            );
          }
        };
        svg.removeEventListener("pointerenter", createBrush);
      }
      svg.addEventListener("pointerenter", createBrush);
      context.dispatchValue(data);
      return g;
    }
  };
}

export function brush(options = {}) {
  return brushTransform("xy", options);
}

export function brushX(options = {}) {
  return brushTransform("x", options);
}

export function brushY(options = {}) {
  return brushTransform("y", options);
}

// Note: mutates value!
function addBrushDomain(k, x, X, value) {
  if (x.type === "band" || x.type === "point") {
    const b = x.bandwidth ?? 0;
    value[k] = x.domain.filter((d) => {
      const v = x.apply(d);
      return X[0] < v + b && v < X[1];
    });
  } else {
    [value[`${k}1`], value[`${k}2`]] = x.invert ? X.map(x.invert).sort(ascending) : X;
  }
}
