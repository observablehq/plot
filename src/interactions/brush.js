import {create} from "../context.js";
import {brush as brusher, brushX as brusherX, brushY as brusherY, union} from "d3";
import {composeRender} from "../mark.js";

function brushTransform(mode, options) {
  return {
    ...options,
    // Unlike other composed transforms, interactive transforms must be the
    // outermost render function because they will re-render dynamically in
    // response to pointer events.
    render: composeRender(function (index, scales, values, dimensions, context, next) {
      const {data} = context.getMarkState(this);
      const {width, height, marginLeft, marginTop, marginRight, marginBottom} = dimensions;
      context.dispatchValue(data);
      let viz = next.call(this, [], scales, values, dimensions, context);
      const {x, y} = scales;
      const {x: X, x1: X1, x2: X2, y: Y, y1: Y1, y2: Y2} = values;

      const Xl = X1 && X2 ? X1.map((d, i) => Math.min(d, X2[i])) : X;
      const Xm = X1 && X2 ? X1.map((d, i) => Math.max(d, X2[i])) : X;
      const Yl = Y1 && Y2 ? Y1.map((d, i) => Math.min(d, Y2[i])) : Y;
      const Ym = Y1 && Y2 ? Y1.map((d, i) => Math.max(d, Y2[i])) : Y;

      // Use a RAF so we have access to the (facet) transform
      window.requestAnimationFrame?.(() => {
        const transform = viz.getAttribute("transform"); // Facet transform
        // Register all brushes on the mark so they can communicate
        if (!this.brushes) this.brushes = [];
        const {brushes} = this;

        const g = create("svg:g", context).attr("transform", transform).attr("class", "brusher");
        viz.replaceWith(g.node());
        viz.removeAttribute("transform");
        g.append(() => viz);

        const extent = [
          [marginLeft, marginTop],
          [width - marginRight, height - marginBottom]
        ];

        const brush = (mode === "xy" ? brusher : mode === "x" ? brusherX : brusherY)().on(
          "brush start end",
          (event) => {
            const {type, selection} = event;
            let S;
            if (selection) {
              S = index;
              if (mode.includes("x")) {
                let [x0, x1] = mode === "xy" ? [selection[0][0], selection[1][0]] : selection;
                if (x?.bandwidth) x0 -= x.bandwidth();
                S = S.filter((i) => x0 <= Xm[i] && Xl[i] <= x1);
              }
              if (mode.includes("y")) {
                let [y0, y1] = mode === "xy" ? [selection[0][1], selection[1][1]] : selection;
                if (y?.bandwidth) y0 -= y.bandwidth();
                S = S.filter((i) => y0 <= Ym[i] && Yl[i] <= y1);
              }
            }
            viz.replaceWith((viz = next.call(this, S ?? [], scales, values, dimensions, context)));

            for (const b of brushes) {
              if (b.brush === brush) {
                b.index = S;
              } else if (type === "start") {
                b.selection.call(b.brush.move, null);
              }
            }
            const filtered = brushes.map(({index}) => index).filter((d) => d);
            context.dispatchValue(
              filtered.length === 0 ? data : Array.from(union(...filtered), (i) => data[i]) // 🌶 todo typed array if data is numeric
            );
          }
        );

        this.brushes.push({brush, selection: g.append("g").call(brush.extent(extent))});
      });

      return viz;
    }, options.render)
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
