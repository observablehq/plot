import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("cell() has the expected defaults", test => {
  const cell = Plot.cell();
  test.strictEqual(cell.data, undefined);
  test.strictEqual(cell.transform, undefined);
  test.deepEqual(cell.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(cell.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4]]);
  test.deepEqual(cell.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(cell.channels.find(c => c.name === "x").type, "band");
  test.strictEqual(cell.channels.find(c => c.name === "y").type, "band");
  test.strictEqual(cell.fill, undefined);
  test.strictEqual(cell.fillOpacity, undefined);
  test.strictEqual(cell.stroke, undefined);
  test.strictEqual(cell.strokeWidth, undefined);
  test.strictEqual(cell.strokeOpacity, undefined);
  test.strictEqual(cell.strokeLinejoin, undefined);
  test.strictEqual(cell.strokeLinecap, undefined);
  test.strictEqual(cell.strokeMiterlimit, undefined);
  test.strictEqual(cell.strokeDasharray, undefined);
  test.strictEqual(cell.mixBlendMode, undefined);
  test.strictEqual(cell.insetTop, 0);
  test.strictEqual(cell.insetRight, 0);
  test.strictEqual(cell.insetBottom, 0);
  test.strictEqual(cell.insetLeft, 0);
});

tape("cell(data, {title}) specifies an optional title channel", test => {
  const cell = Plot.cell(undefined, {title: "x"});
  const title = cell.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "x");
  test.strictEqual(title.scale, undefined);
});

tape("cell(data, {fill}) allows fill to be a constant color", test => {
  const cell = Plot.cell(undefined, {fill: "red"});
  test.strictEqual(cell.fill, "red");
});

tape("cell(data, {fill}) allows fill to be null", test => {
  const cell = Plot.cell(undefined, {fill: null});
  test.strictEqual(cell.fill, "none");
});

tape("cell(data, {fill}) allows fill to be a variable color", test => {
  const cell = Plot.cell(undefined, {fill: "x"});
  test.strictEqual(cell.fill, undefined);
  const fill = cell.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("cell(data, {stroke}) allows stroke to be a constant color", test => {
  const cell = Plot.cell(undefined, {stroke: "red"});
  test.strictEqual(cell.stroke, "red");
});

tape("cell(data, {stroke}) allows stroke to be null", test => {
  const cell = Plot.cell(undefined, {stroke: null});
  test.strictEqual(cell.stroke, undefined);
});

tape("cell(data, {stroke}) allows stroke to be a variable color", test => {
  const cell = Plot.cell(undefined, {stroke: "x"});
  test.strictEqual(cell.stroke, undefined);
  const stroke = cell.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("cellX() defaults x to identity and y to null", test => {
  const cell = Plot.cellX();
  test.strictEqual(cell.data, undefined);
  test.strictEqual(cell.transform, undefined);
  test.deepEqual(cell.channels.map(c => c.name), ["x"]);
  test.deepEqual(cell.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(cell.channels.map(c => c.scale), ["x"]);
  test.strictEqual(cell.channels.find(c => c.name === "x").type, "band");
});

tape("cellY() defaults y to identity and x to null", test => {
  const cell = Plot.cellY();
  test.strictEqual(cell.data, undefined);
  test.strictEqual(cell.transform, undefined);
  test.deepEqual(cell.channels.map(c => c.name), ["y"]);
  test.deepEqual(cell.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(cell.channels.map(c => c.scale), ["y"]);
  test.strictEqual(cell.channels.find(c => c.name === "y").type, "band");
});
