import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function renderFilterPointer() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  const pointerInactive = renderFilter(true);
  const pointerContext = renderFilter(false);
  const pointerFocus = renderFilter(false);
  const plot = Plot.plot({
    y: {grid: true},
    color: {scheme: "BuRd", symmetric: false},
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(bls, pointerInactive({x: "date", y: "unemployment", z: "division", tip: true})),
      Plot.lineY(bls, pointerContext({x: "date", y: "unemployment", z: "division", stroke: "#ccc"})),
      Plot.lineY(bls, pointerFocus({x: "date", y: "unemployment", z: "division", stroke: "red"}))
    ]
  });
  plot.addEventListener("input", () => {
    if (plot.value === null) {
      pointerInactive.update(true);
      pointerContext.update(false);
      pointerFocus.update(false);
    } else {
      const division = plot.value.division;
      pointerInactive.update(false);
      pointerContext.update((d) => d.division !== division);
      pointerFocus.update((d) => d.division === division);
    }
  });
  return plot;
}

// TODO track separate rendered elements per facet
function renderFilter(initialTest = true) {
  let update;
  return Object.assign(
    function apply(options) {
      return {
        ...options,
        render(index, scales, values, dimensions, context, next) {
          const {data} = values;
          const filter = (test) => typeof test === "function" ? index.filter((i) => test(data[i], i, data)) : test ? index : []; // prettier-ignore
          let g = next(filter(initialTest), scales, values, dimensions, context);
          update = (test) => void g.replaceWith((g = next(filter(test), scales, values, dimensions, context)));
          return g;
        }
      };
    },
    {
      update(test) {
        return update?.(test);
      }
    }
  );
}
