import * as Plot from "@observablehq/plot";
import assert from "assert";

it("rect(data, options) has the expected defaults", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3"});
  assert.strictEqual(rect.data, undefined);
  assert.strictEqual(rect.transform, undefined);
  assert.deepStrictEqual(rect.channels.map(c => c.name), ["x1", "y1", "x2", "y2"]);
  assert.deepStrictEqual(rect.channels.map(c => c.value), ["0", "1", "2", "3"]);
  assert.deepStrictEqual(rect.channels.map(c => c.scale), ["x", "y", "x", "y"]);
  assert.strictEqual(rect.fill, undefined);
  assert.strictEqual(rect.fillOpacity, undefined);
  assert.strictEqual(rect.stroke, undefined);
  assert.strictEqual(rect.strokeWidth, undefined);
  assert.strictEqual(rect.strokeOpacity, undefined);
  assert.strictEqual(rect.strokeLinejoin, undefined);
  assert.strictEqual(rect.strokeLinecap, undefined);
  assert.strictEqual(rect.strokeMiterlimit, undefined);
  assert.strictEqual(rect.strokeDasharray, undefined);
  assert.strictEqual(rect.mixBlendMode, undefined);
  assert.strictEqual(rect.insetTop, 0);
  assert.strictEqual(rect.insetRight, 0);
  assert.strictEqual(rect.insetBottom, 0);
  assert.strictEqual(rect.insetLeft, 0);
});

it("rect(data, {title}) specifies an optional title channel", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", title: "4"});
  const title = rect.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "4");
  assert.strictEqual(title.scale, undefined);
});

it("rect(data, {fill}) allows fill to be a constant color", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: "red"});
  assert.strictEqual(rect.fill, "red");
});

it("rect(data, {fill}) allows fill to be null", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: null});
  assert.strictEqual(rect.fill, "none");
});

it("rect(data, {fill}) allows fill to be a variable color", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: "4"});
  assert.strictEqual(rect.fill, undefined);
  const fill = rect.channels.find(c => c.name === "fill");
  assert.strictEqual(fill.value, "4");
  assert.strictEqual(fill.scale, "color");
});

it("rect(data, {stroke}) allows stroke to be a constant color", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "red"});
  assert.strictEqual(rect.stroke, "red");
});

it("rect(data, {stroke}) allows stroke to be null", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: null});
  assert.strictEqual(rect.stroke, undefined);
});

it("rect(data, {stroke}) allows stroke to be a variable color", () => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "4"});
  assert.strictEqual(rect.stroke, undefined);
  const stroke = rect.channels.find(c => c.name === "stroke");
  assert.strictEqual(stroke.value, "4");
  assert.strictEqual(stroke.scale, "color");
});
