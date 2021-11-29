import * as Plot from "@observablehq/plot";
import assert from "assert";

it("image(undefined, {href}) has the expected defaults", () => {
  const image = Plot.image(undefined, {href: ""});
  assert.strictEqual(image.data, undefined);
  assert.strictEqual(image.transform, undefined);
  assert.deepStrictEqual(image.channels.map(c => c.name), ["x", "y", "href"]);
  assert.deepStrictEqual(image.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], [undefined, undefined]]);
  assert.deepStrictEqual(image.channels.map(c => c.scale), ["x", "y", undefined]);
  assert.strictEqual(image.r, 15);
  assert.strictEqual(image.preserveAspectRatio, undefined);
  assert.strictEqual(image.crossOrigin, undefined);
});

it("image(data, {r, href}) allows r to be a constant amount", () => {
  const image = Plot.image(undefined, {r: 42, href: ""});
  assert.strictEqual(image.r, 42);
});

it("image(data, {r, href}) allows r to be a variable amount", () => {
  const image = Plot.image(undefined, {r: "x", href: ""});
  assert.strictEqual(image.r, undefined);
  const r = image.channels.find(c => c.name === "r");
  assert.strictEqual(r.value, "x");
});

it("image(data, {title, href}) specifies an optional title channel", () => {
  const image = Plot.image(undefined, {title: "x", href: ""});
  const title = image.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});
