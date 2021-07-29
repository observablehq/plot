import * as Plot from "@observablehq/plot";
import assert from "assert";

it("text() has the expected defaults", () => {
  const text = Plot.text();
  assert.strictEqual(text.data, undefined);
  assert.strictEqual(text.transform, undefined);
  assert.deepStrictEqual(text.channels.map(c => c.name), ["x", "y", "fontSize", "rotate", "text"]);
  assert.deepStrictEqual(text.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], undefined, undefined, [0, 1]]);
  assert.deepStrictEqual(text.channels.map(c => c.scale), ["x", "y", undefined, undefined, undefined]);
  assert.strictEqual(text.fill, undefined);
  assert.strictEqual(text.fillOpacity, undefined);
  assert.strictEqual(text.stroke, undefined);
  assert.strictEqual(text.strokeWidth, undefined);
  assert.strictEqual(text.strokeOpacity, undefined);
  assert.strictEqual(text.strokeLinejoin, undefined);
  assert.strictEqual(text.strokeLinecap, undefined);
  assert.strictEqual(text.strokeMiterlimit, undefined);
  assert.strictEqual(text.strokeDasharray, undefined);
  assert.strictEqual(text.mixBlendMode, undefined);
  assert.strictEqual(text.textAnchor, undefined);
  assert.strictEqual(text.dx, undefined);
  assert.strictEqual(text.dy, "0.32em");
  assert.strictEqual(text.rotate, 0);
});

it("text(data, {title}) specifies an optional title channel", () => {
  const text = Plot.text(undefined, {title: "x"});
  const title = text.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("text(data, {fill}) allows fill to be a constant color", () => {
  const text = Plot.text(undefined, {fill: "red"});
  assert.strictEqual(text.fill, "red");
});

it("text(data, {fill}) allows fill to be null", () => {
  const text = Plot.text(undefined, {fill: null});
  assert.strictEqual(text.fill, "none");
});

it("text(data, {fill}) allows fill to be a variable color", () => {
  const text = Plot.text(undefined, {fill: "x"});
  assert.strictEqual(text.fill, undefined);
  const fill = text.channels.find(c => c.name === "fill");
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});
