import * as Plot from "@observablehq/plot";
import assert from "assert";

it("text() has the expected defaults", () => {
  const text = Plot.text();
  assert.strictEqual(text.data, undefined);
  assert.strictEqual(text.transform, undefined);
  assert.deepStrictEqual(text.channels.map(c => c.name), ["x", "y", "text"]);
  assert.deepStrictEqual(text.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], [0, 1]]);
  assert.deepStrictEqual(text.channels.map(c => c.scale), ["x", "y", undefined]);
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
  assert.strictEqual(text.shapeRendering, undefined);
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

it("text(data, {stroke}) has a default strokeLinejoin of round", () => {
  const text = Plot.text(undefined, {stroke: "red"});
  assert.strictEqual(text.fill, "none");
  assert.strictEqual(text.stroke, "red");
  assert.strictEqual(text.strokeLinejoin, "round");
});

it("text(data, {fontSize}) allows fontSize to be a number, length, keyword, or percentage", () => {
  assert.strictEqual(Plot.text(undefined, {fontSize: 42}).fontSize, 42);
  assert.strictEqual(Plot.text(undefined, {fontSize: "42"}).fontSize, "42");
  assert.strictEqual(Plot.text(undefined, {fontSize: "42px"}).fontSize, "42px");
  assert.strictEqual(Plot.text(undefined, {fontSize: "42pt"}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 42pt"}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 42pt "}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 50% "}).fontSize, "50%");
  assert.strictEqual(Plot.text(undefined, {fontSize: " Larger "}).fontSize, "larger");
  assert.strictEqual(Plot.text(undefined, {fontSize: "unset"}).fontSize, "unset");
});

it("text(data, {fontSize}) allows fontSize to be a channel", () => {
  const text = Plot.text(undefined, {fontSize: "x"});
  assert.strictEqual(text.fontSize, undefined);
  assert.strictEqual(text.channels.find(c => c.name === "fontSize").value, "x");
});
