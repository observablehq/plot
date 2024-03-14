import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {createScale, createScaleFunctions} from "../../src/scales.js";

export async function zoomDot() {
  const data = await d3.csv("data/gistemp.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    color: {scheme: "BuRd"},
    marks: [Plot.dot(data, zoom({x: "Date", y: "Anomaly", stroke: "Anomaly"}))]
  });
}

// TODO
// - only one zoom per SVG, not per mark+facet
// - compute a new projection
function zoom(options) {
  return {
    ...options,
    render(index, scales, values, dimensions, context, next) {
      let g = next(index, scales, values, dimensions, context);

      // Strategy 1: Recompute the scale domains, then re-scale the channels.
      // const {x, y} = scales.scales;
      // const {x: X, y: Y} = values.channels;
      // d3.select(context.ownerSVGElement).call(
      //   d3.zoom().on("start zoom end", ({transform}) => {
      //     const xDomain = Array.from(x.range, (v) => x.invert(transform.invertX(v)));
      //     const yDomain = Array.from(y.range, (v) => y.invert(transform.invertY(v)));
      //     const xScale = createScale("x", [], {...x, domain: xDomain});
      //     const yScale = createScale("y", [], {...y, domain: yDomain});
      //     const zoomScales = createScaleFunctions({x: xScale, y: yScale});
      //     const zoomValues = this.scale({x: X, y: Y}, zoomScales, context);
      //     const mergeScales = {...scales, ...zoomScales, scales: {...scales.scales, ...zoomScales.scales}};
      //     const mergeValues = {...values, ...zoomValues, channels: {...values.channels, ...zoomValues.channels}};
      //     const r = next(index, mergeScales, mergeValues, dimensions, context);
      //     g.replaceWith(r);
      //     g = r;
      //   })
      // );

      // Strategy 2: Transform the scaled channel values.
      // d3.select(context.ownerSVGElement).call(
      //   d3.zoom().on("start zoom end", ({transform}) => {
      //     const x = values.x.map(transform.applyX, transform);
      //     const y = values.y.map(transform.applyY, transform);
      //     const r = next(index, scales, {...values, x, y}, dimensions, context);
      //     g.replaceWith(r);
      //     g = r;
      //   })
      // );

      // Strategy 3: Transform the G element.
      // const T = Array.from(g.children, (c) => c.getAttribute("transform"));
      // d3.select(context.ownerSVGElement).call(
      //   d3.zoom().on("start zoom end", ({transform}) => {
      //     g.setAttribute("transform", String(transform));
      //     for (let i = 0; i < g.children.length; ++i) {
      //       g.children[i].setAttribute("transform", `${T[i]} scale(${1 / transform.k})`);
      //     }
      //   })
      // );

      // Strategy 4: Update the circles directly.
      const {x: X, y: Y} = values;
      d3.select(context.ownerSVGElement).call(
        d3.zoom().on("start zoom end", ({transform}) => {
          for (let i = 0; i < index.length; ++i) {
            const j = index[i];
            const xj = transform.applyX(X[j]);
            const yj = transform.applyY(Y[j]);
            g.children[i].setAttribute("transform", `translate(${xj},${yj})`);
          }
        })
      );

      return g;
    }
  };
}
