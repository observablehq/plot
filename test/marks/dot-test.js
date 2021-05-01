import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("dot() has the expected defaults", test => {
  const dot = Plot.dot();
  test.strictEqual(dot.data, undefined);
  test.strictEqual(dot.transform, undefined);
  test.deepEqual(dot.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(dot.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4]]);
  test.deepEqual(dot.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(dot.r, 3);
  test.strictEqual(dot.fill, "none");
  test.strictEqual(dot.fillOpacity, undefined);
  test.strictEqual(dot.stroke, "currentColor");
  test.strictEqual(dot.strokeWidth, 1.5);
  test.strictEqual(dot.strokeOpacity, undefined);
  test.strictEqual(dot.strokeLinejoin, undefined);
  test.strictEqual(dot.strokeLinecap, undefined);
  test.strictEqual(dot.strokeMiterlimit, undefined);
  test.strictEqual(dot.strokeDasharray, undefined);
  test.strictEqual(dot.mixBlendMode, undefined);
});

tape("dot(data, {r}) allows r to be a constant radius", test => {
  const dot = Plot.dot(undefined, {r: 42});
  test.strictEqual(dot.r, 42);
});

tape("dot(data, {r}) allows r to be a variable radius", test => {
  const dot = Plot.dot(undefined, {r: "x"});
  test.strictEqual(dot.r, undefined);
  const r = dot.channels.find(c => c.name === "r");
  test.strictEqual(r.value.label, "x");
  test.strictEqual(r.scale, "r");
});

tape("dot(data, {title}) specifies an optional title channel", test => {
  const dot = Plot.dot(undefined, {title: "x"});
  const title = dot.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "x");
  test.strictEqual(title.scale, undefined);
});

tape("dot(data, {fill}) allows fill to be a constant color", test => {
  const dot = Plot.dot(undefined, {fill: "red"});
  test.strictEqual(dot.fill, "red");
});

tape("dot(data, {fill}) allows fill to be null", test => {
  const dot = Plot.dot(undefined, {fill: null});
  test.strictEqual(dot.fill, "none");
});

tape("dot(data, {fill}) allows fill to be a variable color", test => {
  const dot = Plot.dot(undefined, {fill: "x"});
  test.strictEqual(dot.fill, undefined);
  const fill = dot.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("dot(data, {fill}) defaults stroke to undefined if fill is not none", test => {
  test.strictEqual(Plot.dot(undefined, {fill: "red"}).stroke, undefined);
  test.strictEqual(Plot.dot(undefined, {fill: "x"}).stroke, undefined);
  test.strictEqual(Plot.dot(undefined, {fill: "none"}).stroke, "currentColor");
});

tape("dot(data, {stroke}) allows stroke to be a constant color", test => {
  const dot = Plot.dot(undefined, {stroke: "red"});
  test.strictEqual(dot.stroke, "red");
});

tape("dot(data, {stroke}) allows stroke to be null", test => {
  const dot = Plot.dot(undefined, {stroke: null});
  test.strictEqual(dot.stroke, undefined);
});

tape("dot(data, {stroke}) allows stroke to be a variable color", test => {
  const dot = Plot.dot(undefined, {stroke: "x"});
  test.strictEqual(dot.stroke, undefined);
  const stroke = dot.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("dot(data, {stroke}) defaults strokeWidth to 1.5 if stroke is defined", test => {
  test.strictEqual(Plot.dot(undefined, {stroke: "red"}).strokeWidth, 1.5);
  test.strictEqual(Plot.dot(undefined, {stroke: "x"}).strokeWidth, 1.5);
  test.strictEqual(Plot.dot(undefined, {stroke: null}).strokeWidth, undefined);
});
