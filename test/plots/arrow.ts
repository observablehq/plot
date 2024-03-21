import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as Arrow from "apache-arrow";

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
