import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

function highlight({selected = {}, unselected = {}, ...options}: any = {}) {
  return {
    ...options,
    creator() {
      const s = (this.selected = new this.constructor(this.data, {...options, ...selected}));
      const u = (this.unselected = new this.constructor(this.data, {...options, ...unselected}));
      for (const c in selected) if (c in s.channels) this.channels[`selected:${c}`] = s.channels[c];
      for (const c in unselected) if (c in u.channels) this.channels[`unselected:${c}`] = u.channels[c];
    },
    render(index, scales, values, dimensions, context, next) {
      const svg = context.ownerSVGElement;
      const s = this.selected;
      const u = this.unselected;
      const svalues = {...values};
      const uvalues = {...values};
      for (const c in selected) svalues[c] = c in s.channels ? values[`selected:${c}`] : null;
      for (const c in unselected) uvalues[c] = c in u.channels ? values[`unselected:${c}`] : null;
      const g = next(index, scales, values, dimensions, context);
      let ug: ChildNode;
      let sg: ChildNode;

      function pointerenter(event) {
        if (!ug) {
          g.replaceWith((sg = document.createComment("selected")));
          sg.parentNode.insertBefore((ug = document.createComment("unselected")), sg);
        }
        pointermove(event);
      }

      function pointermove(event) {
        const [px, py] = d3.pointer(event);
        const {x, y} = values;
        const S = [];
        const U = [];

        for (const i of index) {
          (Math.hypot(x[i] - px, y[i] - py) < 100 ? S : U).push(i);
        }

        ug.replaceWith((ug = u.render(U, scales, uvalues, dimensions, context)));
        sg.replaceWith((sg = s.render(S, scales, svalues, dimensions, context)));
      }

      function pointerleave() {
        if (ug) {
          ug.replaceWith(g);
          sg.remove();
          sg = null;
          ug = null;
        }
      }

      svg.addEventListener("pointerenter", pointerenter);
      svg.addEventListener("pointermove", pointermove);
      svg.addEventListener("pointerleave", pointerleave);
      const f = svg.ownerDocument.createDocumentFragment();
      f.append(g, svg.ownerDocument.createComment("brush"));
      return f as any; // TODO return a G element instead?
    }
  };
}

export async function highlightDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.dot(
        penguins,
        highlight({
          x: "culmen_length_mm",
          y: "culmen_depth_mm",
          stroke: "species",
          selected: {r: d3.randomLcg(), symbol: "asterisk"},
          unselected: {stroke: "#ccc"}
        })
      )
    ]
  });
}
