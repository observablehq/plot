import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import assert from "./assert.js";
import it from "./jsdom.js";

it("mark data parallel to facet data triggers a warning", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  assert.warns(
    () => Plot.dot(data.slice(), {x: "x", y: "y"}).plot({facet: {data, x: "series"}}),
    /dot mark appears to use faceted data/
  );
});

it("mark data parallel to facet data does not trigger a warning if explicitly faceted", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  assert.doesNotWarn(() =>
    Plot.dot(data.slice(0, 1), {x: "x", y: "y", facet: true}).plot({facet: {data, x: "series"}})
  );
});

it("mark data parallel to facet data does not trigger a warning if explicitly not faceted", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  assert.doesNotWarn(() =>
    Plot.dot(data.slice(0, 1), {x: "x", y: "y", facet: false}).plot({facet: {data, x: "series"}})
  );
});

it("mark data not parallel to facet data does not trigger a warning", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  assert.doesNotWarn(() =>
    Plot.dot(data.slice(0, 1), {x: "x", y: "y", facet: undefined}).plot({facet: {data, x: "series"}})
  );
});
