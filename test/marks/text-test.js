import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("text() has the expected defaults", test => {
  const text = Plot.text();
  test.strictEqual(text.data, undefined);
  test.strictEqual(text.transform, undefined);
  test.deepEqual(text.channels.map(c => c.name), ["x", "y", "fontSize", "rotate", "text"]);
  test.deepEqual(text.channels.map(c => Plot.valueof([[1, 2], [3, 4]], c.value)), [[1, 3], [2, 4], undefined, undefined, [0, 1]]);
  test.deepEqual(text.channels.map(c => c.scale), ["x", "y", undefined, undefined, undefined]);
  test.strictEqual(text.fill, undefined);
  test.strictEqual(text.fillOpacity, undefined);
  test.strictEqual(text.stroke, undefined);
  test.strictEqual(text.strokeWidth, undefined);
  test.strictEqual(text.strokeOpacity, undefined);
  test.strictEqual(text.strokeLinejoin, undefined);
  test.strictEqual(text.strokeLinecap, undefined);
  test.strictEqual(text.strokeMiterlimit, undefined);
  test.strictEqual(text.strokeDasharray, undefined);
  test.strictEqual(text.mixBlendMode, undefined);
  test.strictEqual(text.textAnchor, undefined);
  test.strictEqual(text.dx, undefined);
  test.strictEqual(text.dy, "0.32em");
  test.strictEqual(text.rotate, 0);
});

tape("text(data, {z}) specifies an optional z channel", test => {
  const text = Plot.text(undefined, {z: "x"});
  const z = text.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "x");
  test.strictEqual(z.scale, undefined);
});

tape("text(data, {title}) specifies an optional title channel", test => {
  const text = Plot.text(undefined, {title: "x"});
  const title = text.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "x");
  test.strictEqual(title.scale, undefined);
});

tape("text(data, {fill}) allows fill to be a constant color", test => {
  const text = Plot.text(undefined, {fill: "red"});
  test.strictEqual(text.fill, "red");
});

tape("text(data, {fill}) allows fill to be null", test => {
  const text = Plot.text(undefined, {fill: null});
  test.strictEqual(text.fill, "none");
});

tape("text(data, {fill}) allows fill to be a variable color", test => {
  const text = Plot.text(undefined, {fill: "x"});
  test.strictEqual(text.fill, undefined);
  const fill = text.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});
