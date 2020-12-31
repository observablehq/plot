import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("link(data, options) has the expected defaults", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3"});
  test.strictEqual(link.data, undefined);
  test.strictEqual(link.transform("foo"), "foo");
  test.deepEqual(link.channels.map(c => c.name), ["x1", "y1", "x2", "y2"]);
  test.deepEqual(link.channels.map(c => c.value), ["0", "1", "2", "3"]);
  test.deepEqual(link.channels.map(c => c.scale), ["x", "y", "x", "y"]);
  test.strictEqual(link.fill, undefined);
  test.strictEqual(link.fillOpacity, undefined);
  test.strictEqual(link.stroke, "currentColor");
  test.strictEqual(link.strokeWidth, undefined);
  test.strictEqual(link.strokeOpacity, undefined);
  test.strictEqual(link.strokeLinejoin, undefined);
  test.strictEqual(link.strokeLinecap, undefined);
  test.strictEqual(link.strokeMiterlimit, undefined);
  test.strictEqual(link.strokeDasharray, undefined);
  test.strictEqual(link.mixBlendMode, undefined);
});

tape("link(data, {z}) specifies an optional z channel", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", z: "4"});
  const z = link.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "4");
  test.strictEqual(z.scale, undefined);
});

tape("link(data, {title}) specifies an optional title channel", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", title: "4"});
  const title = link.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "4");
  test.strictEqual(title.scale, undefined);
});

tape("link(data, {stroke}) allows stroke to be a constant color", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "red"});
  test.strictEqual(link.stroke, "red");
});

tape("link(data, {stroke}) allows stroke to be null", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: null});
  test.strictEqual(link.stroke, undefined);
});

tape("link(data, {stroke}) allows stroke to be a variable color", test => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "4"});
  test.strictEqual(link.stroke, undefined);
  const stroke = link.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "4");
  test.strictEqual(stroke.scale, "color");
});
