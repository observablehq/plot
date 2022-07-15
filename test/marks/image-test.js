import * as Plot from "@observablehq/plot";
import assert from "assert";

it("image(undefined, {src}) has the expected defaults", () => {
  const image = Plot.image(undefined, {src: "foo"});
  assert.strictEqual(image.data, undefined);
  assert.strictEqual(image.transform, undefined);
  assert.deepStrictEqual(Object.keys(image.channels), ["x", "y", "src"]);
  assert.deepStrictEqual(Object.values(image.channels).map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], [undefined, undefined]]);
  assert.deepStrictEqual(Object.values(image.channels).map(c => c.scale), ["x", "y", undefined]);
  assert.strictEqual(image.width, 16);
  assert.strictEqual(image.height, 16);
  assert.strictEqual(image.preserveAspectRatio, undefined);
  assert.strictEqual(image.crossOrigin, undefined);
});

it("image(data, {width, height, src}) allows width and height to be a constant amount", () => {
  const image = Plot.image(undefined, {width: 42, height: 43, src: "foo"});
  assert.strictEqual(image.width, 42);
  assert.strictEqual(image.height, 43);
});

it("image(data, {width, height, src}) allows width and height to be a variable amount", () => {
  const image = Plot.image(undefined, {width: "x", height: "y", src: "foo"});
  assert.strictEqual(image.width, undefined);
  assert.strictEqual(image.height, undefined);
  const {width} = image.channels;
  const {height} = image.channels;
  assert.strictEqual(width.value, "x");
  assert.strictEqual(height.value, "y");
});

it("image(data, {title, src}) specifies an optional title channel", () => {
  const image = Plot.image(undefined, {title: "x", src: "foo"});
  const {title} = image.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("image(data, {src}) allows src to be a constant", () => {
  assert.strictEqual(Plot.image(undefined, {src: "./foo.png"}).src, "./foo.png");
  assert.strictEqual(Plot.image(undefined, {src: "../foo.png"}).src, "../foo.png");
  assert.strictEqual(Plot.image(undefined, {src: "/foo.png"}).src, "/foo.png");
  assert.strictEqual(Plot.image(undefined, {src: "https://example.com/foo.png"}).src, "https://example.com/foo.png");
  assert.strictEqual(Plot.image(undefined, {src: "http://example.com/foo.png"}).src, "http://example.com/foo.png");
  assert.strictEqual(Plot.image(undefined, {src: "blob:https://login.worker.test:5000/67f16cef-373a-4019-aefe-d4d68937e5fa"}).src, "blob:https://login.worker.test:5000/67f16cef-373a-4019-aefe-d4d68937e5fa");
  assert.strictEqual(Plot.image(undefined, {src: "data:image/png;base64,=="}).src, "data:image/png;base64,==");
});

it("image(data, {src}) allows src to be a channel", () => {
  const image = Plot.image(undefined, {src: "foo"});
  const {src} = image.channels;
  assert.strictEqual(src.value, "foo");
  assert.strictEqual(src.scale, undefined);
});
