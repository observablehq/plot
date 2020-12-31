import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("TickX() has the expected defaults", test => {
  const tick = new Plot.TickX();
  test.strictEqual(tick.data, undefined);
  test.strictEqual(tick.transform("foo"), "foo");
  test.deepEqual(tick.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(tick.channels.map(c => c.value("foo", 0)), ["foo", 0]);
  test.deepEqual(tick.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(tick.channels.find(c => c.name === "y").type, "band");
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

tape("TickX(data, {z}) specifies an optional z channel", test => {
  const tick = new Plot.TickX([{x: 1}, {x: 2}, {x: 3}], {z: "x"});
  const z = tick.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "x");
  test.strictEqual(z.scale, undefined);
});

tape("TickX(data, {title}) specifies an optional title channel", test => {
  const tick = new Plot.TickX([{x: 1}, {x: 2}, {x: 3}], {title: "x"});
  const title = tick.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("TickX(data, {stroke}) allows stroke to be a constant color", test => {
  const tick = new Plot.TickX([{x: 1}, {x: 2}, {x: 3}], {stroke: "red"});
  test.strictEqual(tick.stroke, "red");
});

tape("TickX(data, {stroke}) allows stroke to be null", test => {
  const tick = new Plot.TickX([{x: 1}, {x: 2}, {x: 3}], {stroke: null});
  test.strictEqual(tick.stroke, undefined);
});

tape("TickX(data, {stroke}) allows stroke to be a variable color", test => {
  const tick = new Plot.TickX([{x: 1}, {x: 2}, {x: 3}], {stroke: "x"});
  test.strictEqual(tick.stroke, undefined);
  const stroke = tick.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("TickY() has the expected defaults", test => {
  const tick = new Plot.TickY();
  test.strictEqual(tick.data, undefined);
  test.strictEqual(tick.transform("foo"), "foo");
  test.deepEqual(tick.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(tick.channels.map(c => c.value("foo", 0)), [0, "foo"]);
  test.deepEqual(tick.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(tick.channels.find(c => c.name === "x").type, "band");
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

tape("TickY(data, {z}) specifies an optional z channel", test => {
  const tick = new Plot.TickY([{x: 1}, {x: 2}, {x: 3}], {z: "x"});
  const z = tick.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "x");
  test.strictEqual(z.scale, undefined);
});

tape("TickY(data, {title}) specifies an optional title channel", test => {
  const tick = new Plot.TickY([{x: 1}, {x: 2}, {x: 3}], {title: "x"});
  const title = tick.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("TickY(data, {stroke}) allows stroke to be a constant color", test => {
  const tick = new Plot.TickY([{x: 1}, {x: 2}, {x: 3}], {stroke: "red"});
  test.strictEqual(tick.stroke, "red");
});

tape("TickY(data, {stroke}) allows stroke to be null", test => {
  const tick = new Plot.TickY([{x: 1}, {x: 2}, {x: 3}], {stroke: null});
  test.strictEqual(tick.stroke, undefined);
});

tape("TickY(data, {stroke}) allows stroke to be a variable color", test => {
  const tick = new Plot.TickY([{x: 1}, {x: 2}, {x: 3}], {stroke: "x"});
  test.strictEqual(tick.stroke, undefined);
  const stroke = tick.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});
