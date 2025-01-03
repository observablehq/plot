import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as Arrow from "apache-arrow";
import {html} from "htl";

/**
 * An arrow table dataset supports direct (getChild) accessors.
 */
export async function arrowTest() {
  const data = Arrow.tableFromArrays({
    id: [1, 2, 3],
    name: ["Alice", "Bob", "Charlie"],
    age: [35, 25, 45]
  });
  return Plot.barY(data, {x: "name", y: "age"}).plot();
}

/**
 * An arrow table dataset supports function accessors.
 */
export async function arrowTestAccessor() {
  const data = Arrow.tableFromArrays({
    id: [1, 2, 3],
    name: ["Alice", "Bob", "Charlie"],
    age: [35, 25, 45]
  });

  return Plot.barY(data, {x: "name", y: "age", fill: (d) => d.name}).plot();
}

/**
 * An arrow table dataset supports binning.
 */
export async function arrowTestBin() {
  const seed = d3.randomLcg(42);
  const vector = Uint8Array.from({length: 1e5}, d3.randomExponential.source(seed)(1));
  const category = Array.from({length: 1e5}, d3.randomInt.source(seed)(4)).map((i) => `a${i}`);
  const data = Arrow.tableFromArrays({category, vector});
  return Plot.rectY(data, Plot.binX({y: "count"}, {x: "vector", fill: "category", thresholds: 10})).plot({
    marginLeft: 60
  });
}

/**
 * An arrow table dataset supports grouping.
 */
export async function arrowTestGroup() {
  const seed = d3.randomLcg(42);
  const vector = Uint8Array.from({length: 1e5}, d3.randomExponential.source(seed)(1));
  const category = Array.from({length: 1e5}, d3.randomInt.source(seed)(4)).map((i) => `a${i}`);
  const data = Arrow.tableFromArrays({category, vector});
  return Plot.barY(data, Plot.groupX({y: "count"}, {x: "vector", fill: "category"})).plot({marginLeft: 60});
}

/**
 * An arrow table dataset supports sorting with a comparator.
 */
export async function arrowTestSort() {
  const data = Arrow.tableFromArrays({
    id: [1, 2, 3],
    name: ["Alice", "Bob", "Charlie"],
    age: [35, 25, 45]
  });
  return Plot.barX(data, {x: "age", fill: "name", sort: (a: {age: number}, b: {age: number}) => b.age - a.age}).plot();
}

/**
 * An arrow table dataset supports accessing the node's datum.
 */
export async function arrowTestTree() {
  const gods = Arrow.tableFromArrays({
    branch: `Chaos Gaia Mountains
Chaos Gaia Pontus
Chaos Gaia Uranus
Chaos Eros
Chaos Erebus
Chaos Tartarus`
      .split("\n")
      .map((d) => d.replace(/\s+/g, "/"))
  });
  return Plot.plot({
    axis: null,
    insetLeft: 35,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [Plot.tree(gods, {path: "branch", fill: (d) => d?.branch})]
  });
}

/**
 * An arrow table dataset supports Plot.find.
 */
export async function arrowTestDifferenceY() {
  const stocks = Arrow.tableFromJSON(await readStocks());
  return Plot.plot({
    marks: [
      Plot.differenceY(
        stocks,
        Plot.normalizeY(
          Plot.groupX(
            {y1: Plot.find((d) => d.Symbol === "GOOG"), y2: Plot.find((d) => d.Symbol === "AAPL")},
            {x: "Date", y: "Close", tip: true}
          )
        )
      )
    ]
  });
}

async function readStocks(start = 0, end = Infinity) {
  return (
    await Promise.all(
      ["AAPL", "GOOG"].map((symbol) =>
        d3.csv<any>(`data/${symbol.toLowerCase()}.csv`, (d, i) =>
          start <= i && i < end ? ((d.Symbol = symbol), d3.autoType(d)) : null
        )
      )
    )
  ).flat();
}

/**
 * An arrow table dataset supports stack custom order.
 */
export async function arrowTestCustomOrder() {
  const riaa = Arrow.tableFromJSON(await d3.csv<any>("data/riaa-us-revenue.csv", d3.autoType));
  return Plot.plot({
    y: {
      grid: true,
      label: "Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [
      Plot.areaY(
        riaa,
        Plot.stackY({
          x: "year",
          y: "revenue",
          z: "format",
          order: (a, b) => d3.ascending(a.group, b.group) || d3.descending(a.revenue, b.revenue),
          fill: "group",
          stroke: "white",
          title: (d) => `${d.format}\n${d.group}`
        })
      ),
      Plot.ruleY([0])
    ]
  });
}

/**
 * An arrow table dataset works with the pointer.
 */
export async function arrowTestPointer() {
  const penguins = Arrow.tableFromJSON(await d3.csv<any>("data/penguins.csv", d3.autoType));
  const plot = Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", tip: true}).plot();
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = JSON.stringify(plot.value, null, 2));
  oninput(); // initialize the textarea to the initial value
  plot.oninput = oninput; // update during interaction
  return html`<figure>${plot}${textarea}</figure>`;
}
