import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("image(undefined, {href}) has the expected defaults", test => {
  const image = Plot.image(undefined, {href: ""});
  test.strictEqual(image.data, undefined);
  test.strictEqual(image.transform, undefined);
  test.deepEqual(image.channels.map(c => c.name), ["x", "y", "href"]);
  test.deepEqual(image.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], [undefined, undefined]]);
  test.deepEqual(image.channels.map(c => c.scale), ["x", "y", undefined]);
  test.strictEqual(image.size, 20);
});

tape("image(data, {size, href}) allows size to be a constant amount", test => {
  const image = Plot.image(undefined, {size: 42, href: ""});
  test.strictEqual(image.size, 42);
});

tape("image(data, {size, href}) allows size to be a variable amount", test => {
  const image = Plot.image(undefined, {size: "x", href: ""});
  test.strictEqual(image.r, undefined);
  const r = image.channels.find(c => c.name === "size");
  test.strictEqual(r.value, "x");
});

tape("image(data, {title, href}) specifies an optional title channel", test => {
  const image = Plot.image(undefined, {title: "x", href: ""});
  const title = image.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});