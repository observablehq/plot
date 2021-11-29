import * as Plot from "@observablehq/plot";
import assert from "assert";

it("image(undefined, {src}) has the expected defaults", () => {
  const image = Plot.image(undefined, {src: ""});
  assert.strictEqual(image.data, undefined);
  assert.strictEqual(image.transform, undefined);
  assert.deepStrictEqual(image.channels.map(c => c.name), ["x", "y", "src"]);
  assert.deepStrictEqual(image.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], [undefined, undefined]]);
  assert.deepStrictEqual(image.channels.map(c => c.scale), ["x", "y", undefined]);
  assert.strictEqual(image.width, 16);
  assert.strictEqual(image.height, 16);
  assert.strictEqual(image.preserveAspectRatio, undefined);
  assert.strictEqual(image.crossOrigin, undefined);
});

it("image(data, {width, height, src}) allows width and height to be a constant amount", () => {
  const image = Plot.image(undefined, {width: 42, height: 43, src: ""});
  assert.strictEqual(image.width, 42);
  assert.strictEqual(image.height, 43);
});

it("image(data, {width, height, src}) allows width and height to be a variable amount", () => {
  const image = Plot.image(undefined, {width: "x", height: "y", src: ""});
  assert.strictEqual(image.width, undefined);
  assert.strictEqual(image.height, undefined);
  const width = image.channels.find(c => c.name === "width");
  const height = image.channels.find(c => c.name === "height");
  assert.strictEqual(width.value, "x");
  assert.strictEqual(height.value, "y");
});

it("image(data, {title, src}) specifies an optional title channel", () => {
  const image = Plot.image(undefined, {title: "x", src: ""});
  const title = image.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});
