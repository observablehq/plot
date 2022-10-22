import * as Plot from "@observablehq/plot";
import assert from "assert";
import * as d3 from "d3";
import it from "./jsdom.js";

async function assertWarnings(run, expected) {
  const actual = [];
  const warn = console.warn;
  try {
    console.warn = (warning) => void actual.push(warning);
    await run();
    assert.deepStrictEqual(actual, expected);
  } finally {
    console.warn = warn;
  }
}

it("mark data parallel to facet data triggers a warning", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  await assertWarnings(
    () => Plot.dot(data.slice(), {x: "x", y: "y"}).plot({facet: {data, x: "series"}}),
    [
      'Warning: the dot mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.'
    ]
  );
});

it("mark data parallel to facet data does not trigger a warning if explicitly faceted", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  await assertWarnings(
    () => Plot.dot(data.slice(0, 1), {x: "x", y: "y", facet: true}).plot({facet: {data, x: "series"}}),
    []
  );
});

it("mark data parallel to facet data does not trigger a warning if explicitly not faceted", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  await assertWarnings(
    () => Plot.dot(data.slice(0, 1), {x: "x", y: "y", facet: false}).plot({facet: {data, x: "series"}}),
    []
  );
});

it("mark data not parallel to facet data does not trigger a warning", async () => {
  const data = await d3.csv("data/anscombe.csv", d3.autoType);
  await assertWarnings(
    () => Plot.dot(data.slice(0, 1), {x: "x", y: "y"}).plot({facet: {data, x: "series"}}),
    []
  );
});
