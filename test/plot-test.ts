import * as Plot from "@observablehq/plot";
import assert from "assert";
import it from "./jsdom.js";

it("plot({aspectRatio}) rejects unsupported scale types", () => {
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, x: {type: "symlog"}}), /^Error: unsupported x scale for aspectRatio: symlog$/); // prettier-ignore
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, y: {type: "symlog"}}), /^Error: unsupported y scale for aspectRatio: symlog$/); // prettier-ignore
});

it("plot({locale}) localizes default axis tick formatting", () => {
  const plot = Plot.plot({
    locale: "fr",
    x: {type: "linear"},
    marks: [Plot.axisX([12345])]
  });
  assert.ok(plot.querySelector("text")?.textContent?.includes("12\u202f345"));
});

it("plot({locale}) localizes default tip formatting", () => {
  const plot = Plot.plot({
    locale: "fr",
    marks: [Plot.tip([{x: 12345, y: 1}], {x: "x", y: "y"})]
  });
  assert.ok(plot.textContent?.includes("12\u202f345"));
});

it("plot({locale}) localizes default time axis formatting", () => {
  const plot = Plot.plot({
    locale: "fr",
    x: {type: "utc", domain: [new Date("2023-01-01"), new Date("2024-01-01")]}
  });
  assert.ok(plot.textContent?.includes("janv."));
  assert.ok(!plot.textContent?.includes("Jan"));
});
