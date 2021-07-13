import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("tickX() has the expected defaults", test => {
  const tick = Plot.tickX();
  test.strictEqual(tick.data, undefined);
  test.strictEqual(tick.transform, undefined);
  test.deepEqual(tick.channels.map(c => c.name), ["x"]);
  test.deepEqual(tick.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(tick.channels.map(c => c.scale), ["x"]);
  test.strictEqual(tick.fill, undefined);
  test.strictEqual(tick.fillOpacity, undefined);
  test.strictEqual(tick.stroke, "currentColor");
  test.strictEqual(tick.strokeWidth, undefined);
  test.strictEqual(tick.strokeOpacity, undefined);
  test.strictEqual(tick.strokeLinejoin, undefined);
  test.strictEqual(tick.strokeLinecap, undefined);
  test.strictEqual(tick.strokeMiterlimit, undefined);
  test.strictEqual(tick.strokeDasharray, undefined);
  test.strictEqual(tick.mixBlendMode, undefined);
});

tape("tickX(data, {y}) uses a band scale", test => {
  const tick = Plot.tickX(undefined, {y: "x"});
  test.deepEqual(tick.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(tick.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(tick.channels.find(c => c.name === "y").type, "band");
  test.strictEqual(tick.channels.find(c => c.name === "y").value, "x");
});

tape("tickX(data, {title}) specifies an optional title channel", test => {
  const tick = Plot.tickX(undefined, {title: "x"});
  const title = tick.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("tickX(data, {stroke}) allows stroke to be a constant color", test => {
  const tick = Plot.tickX(undefined, {stroke: "red"});
  test.strictEqual(tick.stroke, "red");
});

tape("tickX(data, {stroke}) allows stroke to be null", test => {
  const tick = Plot.tickX(undefined, {stroke: null});
  test.strictEqual(tick.stroke, undefined);
});

tape("tickX(data, {stroke}) allows stroke to be a variable color", test => {
  const tick = Plot.tickX(undefined, {stroke: "x"});
  test.strictEqual(tick.stroke, undefined);
  const stroke = tick.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("tickY() has the expected defaults", test => {
  const tick = Plot.tickY();
  test.strictEqual(tick.data, undefined);
  test.strictEqual(tick.transform, undefined);
  test.deepEqual(tick.channels.map(c => c.name), ["y"]);
  test.deepEqual(tick.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(tick.channels.map(c => c.scale), ["y"]);
  test.strictEqual(tick.fill, undefined);
  test.strictEqual(tick.fillOpacity, undefined);
  test.strictEqual(tick.stroke, "currentColor");
  test.strictEqual(tick.strokeWidth, undefined);
  test.strictEqual(tick.strokeOpacity, undefined);
  test.strictEqual(tick.strokeLinejoin, undefined);
  test.strictEqual(tick.strokeLinecap, undefined);
  test.strictEqual(tick.strokeMiterlimit, undefined);
  test.strictEqual(tick.strokeDasharray, undefined);
  test.strictEqual(tick.mixBlendMode, undefined);
});

tape("tickY(data, {x}) uses a band scale", test => {
  const tick = Plot.tickY(undefined, {x: "y"});
  test.deepEqual(tick.channels.map(c => c.name), ["y", "x"]);
  test.deepEqual(tick.channels.map(c => c.scale), ["y", "x"]);
  test.strictEqual(tick.channels.find(c => c.name === "x").type, "band");
  test.strictEqual(tick.channels.find(c => c.name === "x").value, "y");
});

tape("tickY(data, {title}) specifies an optional title channel", test => {
  const tick = Plot.tickY(undefined, {title: "x"});
  const title = tick.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("tickY(data, {stroke}) allows stroke to be a constant color", test => {
  const tick = Plot.tickY(undefined, {stroke: "red"});
  test.strictEqual(tick.stroke, "red");
});

tape("tickY(data, {stroke}) allows stroke to be null", test => {
  const tick = Plot.tickY(undefined, {stroke: null});
  test.strictEqual(tick.stroke, undefined);
});

tape("tickY(data, {stroke}) allows stroke to be a variable color", test => {
  const tick = Plot.tickY(undefined, {stroke: "x"});
  test.strictEqual(tick.stroke, undefined);
  const stroke = tick.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});
