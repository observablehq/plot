import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const brands = await d3.csv("data/category-brands.csv", d3.autoType);
  return Plot.plot({
    marginTop: 20,
    marginLeft: 10,
    x: {axis: null},
    y: {domain: d3.range(0, 15), axis: null},
    time: {delay: 1000, duration: 10000},
    marks: [
      Plot.barX(brands, Plot.map({
        x: values => {
          const m = d3.max(values);
          return values.map(d => d/m);
        },
        y: "rank"
      }, {
        x: "value",
        y: d => -d.value,
        fill: "category",
        time: "date",
        key: "name",
        z: null
      })),
      Plot.tickX(brands, ticks({
        x: "value",
        time: "date",
        stroke: "white"
      })),
      Plot.text(brands, ticks({
        x: "value",
        time: "date",
        frameAnchor: "top",
        dy: -20,
        fontSize: 8
      })),
      Plot.text(brands, Plot.selectMaxX({
        text: d => `${d.date.getUTCFullYear()}`,
        frameAnchor: "bottom-right",
        time: "date",
        x: d => d.value * 1e-9 + 1,
        dy: -15,
        fontSize: 40,
        fontWeight: "bold"
      })),
      Plot.text(brands, Plot.selectMaxX({
        x: d => d.value * 1e-9 + 1,
        text: "value",
        frameAnchor: "top-right",
        time: "date",
        fill: "black",
        stroke:"white",
        strokeWidth: 7,
        dy: -20
      })),
      Plot.textX(brands, Plot.map({
        x: values => {
          const m = d3.max(values);
          return values.map(d => d / m);
        },
        y: "rank"
      }, {
        x: "value",
        y: d => -d.value,
        text: "name",
        textAnchor: "end",
        dx: -4,
        time: "date",
        key: "name",
        fill: "white",
        stroke: "category",
        strokeWidth: 3,
        z: null
      }))
    ]
  });

  // TODO: In this example we would want to set "enter-tween" and "exit-tween" to constant(0)
  function ticks({x, text, ticks = 8, ...options}) {
    const [X, setX] = Plot.column(x);
    const [T, setT] = Plot.column(text);
    const textFormat = d3.format(","); // string, no interpolation

    const transform = (data, facets) => {
      const newFacets = [];
      const V = Plot.valueof(data, x);
      const T = setT && setT([]);
      const X = setX([]);
      for (const facet of facets) {
        const newFacet = [];
        const M = d3.max(facet, i => V[i]);
        for (const value of d3.ticks(0, M, ticks).slice(0, -1)) {
          newFacet.push(X.length);
          T && T.push(textFormat(value));
          X.push(value / M);
        }
        newFacets.push(newFacet);
      }
      return {data: X, facets: newFacets};
    };
    return {
      transform,
      x: X,
      ...T && {key: T},
      ...T && {text: T},
      ...options
    };
  }
}
