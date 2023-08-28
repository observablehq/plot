import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function highlightDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {
        x: "culmen_length_mm",
        y: "culmen_depth_mm",
        r: d3.randomLcg(42),
        fill: "species",
        fillOpacity: 0.1,
        stroke: "species",
        render(index, scales, values, dimensions, context, next) {
          const svg = context.ownerSVGElement;
          const ovalues = {...values, fill: null, stroke: null};
          const g = next(index, scales, values, dimensions, context);
          const gg = svg.ownerDocument.createElementNS(svg.namespaceURI, "g");
          gg.appendChild(g);
          let og: Element | Comment; // =
          let ig: Element | Comment; // = gg.appendChild(document.createComment("selected"));

          function pointerenter(event) {
            // g.replaceWith(gg);
            g.remove();
            if (!ig) ig = gg.appendChild(document.createComment("unselected"));
            if (!og) og = gg.appendChild(document.createComment("unselected"));
            pointermove(event);
          }

          function pointermove(event) {
            const [px, py] = d3.pointer(event);
            const {x, y} = values;
            const I = [];
            const O = [];

            for (const i of index) {
              (Math.hypot(x[i] - px, y[i] - py) < 100 ? I : O).push(i);
            }

            ig.replaceWith((ig = next(O, scales, ovalues, dimensions, context)));
            og.replaceWith((og = next(I, scales, values, dimensions, context)));
          }

          function pointerleave() {
            // gg.replaceWith(g);
            if (ig) ig.remove(), (ig = null);
            if (og) og.remove(), (og = null);
            gg.insertBefore(g, gg.firstChild);
          }

          svg.addEventListener("pointerenter", pointerenter);
          svg.addEventListener("pointermove", pointermove);
          svg.addEventListener("pointerleave", pointerleave);
          return gg;
        }
      })
    ]
  });
}
