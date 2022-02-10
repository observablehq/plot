import * as Plot from "@observablehq/plot";
import assert from "assert";

it("cell() has the expected defaults", () => {
  const cell = Plot.cell();
  assert.strictEqual(cell.data, undefined);
  assert.strictEqual(cell.transform, undefined);
  assert.deepStrictEqual(cell.channels.map(c => c.name), ["x", "y"]);
  assert.deepStrictEqual(cell.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4]]);
  assert.deepStrictEqual(cell.channels.map(c => c.scale), ["x", "y"]);
  assert.strictEqual(cell.channels.find(c => c.name === "x").type, "band");
  assert.strictEqual(cell.channels.find(c => c.name === "y").type, "band");
  assert.strictEqual(cell.fill, undefined);
  assert.strictEqual(cell.fillOpacity, undefined);
  assert.strictEqual(cell.stroke, undefined);
  assert.strictEqual(cell.strokeWidth, undefined);
  assert.strictEqual(cell.strokeOpacity, undefined);
  assert.strictEqual(cell.strokeLinejoin, undefined);
  assert.strictEqual(cell.strokeLinecap, undefined);
  assert.strictEqual(cell.strokeMiterlimit, undefined);
  assert.strictEqual(cell.strokeDasharray, undefined);
  assert.strictEqual(cell.strokeDashoffset, undefined);
  assert.strictEqual(cell.mixBlendMode, undefined);
  assert.strictEqual(cell.shapeRendering, undefined);
  assert.strictEqual(cell.insetTop, 0);
  assert.strictEqual(cell.insetRight, 0);
  assert.strictEqual(cell.insetBottom, 0);
  assert.strictEqual(cell.insetLeft, 0);
});

it("cell(data, {title}) specifies an optional title channel", () => {
  const cell = Plot.cell(undefined, {title: "x"});
  const title = cell.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("cell(data, {fill}) allows fill to be a constant color", () => {
  const cell = Plot.cell(undefined, {fill: "red"});
  assert.strictEqual(cell.fill, "red");
});

it("cell(data, {fill}) allows fill to be null", () => {
  const cell = Plot.cell(undefined, {fill: null});
  assert.strictEqual(cell.fill, "none");
});

it("cell(data, {fill}) allows fill to be a variable color", () => {
  const cell = Plot.cell(undefined, {fill: "x"});
  assert.strictEqual(cell.fill, undefined);
  const fill = cell.channels.find(c => c.name === "fill");
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});

it("cell(data, {stroke}) allows stroke to be a constant color", () => {
  const cell = Plot.cell(undefined, {stroke: "red"});
  assert.strictEqual(cell.stroke, "red");
});

it("cell(data, {stroke}) allows stroke to be null", () => {
  const cell = Plot.cell(undefined, {stroke: null});
  assert.strictEqual(cell.stroke, undefined);
});

it("cell(data, {stroke}) allows stroke to be a variable color", () => {
  const cell = Plot.cell(undefined, {stroke: "x"});
  assert.strictEqual(cell.stroke, undefined);
  const stroke = cell.channels.find(c => c.name === "stroke");
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("cellX() defaults x to identity and y to null", () => {
  const cell = Plot.cellX();
  assert.strictEqual(cell.data, undefined);
  assert.strictEqual(cell.transform, undefined);
  assert.deepStrictEqual(cell.channels.map(c => c.name), ["x", "fill"]);
  assert.deepStrictEqual(cell.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[ 0, 1, 2 ], [ 1, 2, 3 ]]);
  assert.deepStrictEqual(cell.channels.map(c => c.scale), ["x", "color"]);
  assert.strictEqual(cell.channels.find(c => c.name === "x").type, "band");
});

it("cellY() defaults y to identity and x to null", () => {
  const cell = Plot.cellY();
  assert.strictEqual(cell.data, undefined);
  assert.strictEqual(cell.transform, undefined);
  assert.deepStrictEqual(cell.channels.map(c => c.name), ["y", "fill"]);
  assert.deepStrictEqual(cell.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[ 0, 1, 2 ], [ 1, 2, 3 ]]);
  assert.deepStrictEqual(cell.channels.map(c => c.scale), ["y", "color"]);
  assert.strictEqual(cell.channels.find(c => c.name === "y").type, "band");
});
