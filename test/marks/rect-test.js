import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("rect(data, options) has the expected defaults", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3"});
  test.strictEqual(rect.data, undefined);
  test.strictEqual(rect.transform("foo"), "foo");
  test.deepEqual(rect.channels.map(c => c.name), ["x1", "y1", "x2", "y2"]);
  test.deepEqual(rect.channels.map(c => c.value), ["0", "1", "2", "3"]);
  test.deepEqual(rect.channels.map(c => c.scale), ["x", "y", "x", "y"]);
  test.strictEqual(rect.fill, undefined);
  test.strictEqual(rect.fillOpacity, undefined);
  test.strictEqual(rect.stroke, undefined);
  test.strictEqual(rect.strokeWidth, undefined);
  test.strictEqual(rect.strokeOpacity, undefined);
  test.strictEqual(rect.strokeLinejoin, undefined);
  test.strictEqual(rect.strokeLinecap, undefined);
  test.strictEqual(rect.strokeMiterlimit, undefined);
  test.strictEqual(rect.strokeDasharray, undefined);
  test.strictEqual(rect.mixBlendMode, undefined);
  test.strictEqual(rect.insetTop, 0);
  test.strictEqual(rect.insetRight, 0);
  test.strictEqual(rect.insetBottom, 0);
  test.strictEqual(rect.insetLeft, 0);
});

tape("rect(data, {z}) specifies an optional z channel", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", z: "4"});
  const z = rect.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "4");
  test.strictEqual(z.scale, undefined);
});

tape("rect(data, {title}) specifies an optional title channel", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", title: "4"});
  const title = rect.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "4");
  test.strictEqual(title.scale, undefined);
});

tape("rect(data, {fill}) allows fill to be a constant color", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: "red"});
  test.strictEqual(rect.fill, "red");
});

tape("rect(data, {fill}) allows fill to be null", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: null});
  test.strictEqual(rect.fill, "none");
});

tape("rect(data, {fill}) allows fill to be a variable color", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", fill: "4"});
  test.strictEqual(rect.fill, undefined);
  const fill = rect.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value, "4");
  test.strictEqual(fill.scale, "color");
});

tape("rect(data, {stroke}) allows stroke to be a constant color", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "red"});
  test.strictEqual(rect.stroke, "red");
});

tape("rect(data, {stroke}) allows stroke to be null", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: null});
  test.strictEqual(rect.stroke, undefined);
});

tape("rect(data, {stroke}) allows stroke to be a variable color", test => {
  const rect = Plot.rect(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "4"});
  test.strictEqual(rect.stroke, undefined);
  const stroke = rect.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "4");
  test.strictEqual(stroke.scale, "color");
});
