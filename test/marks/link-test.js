import * as Plot from "@observablehq/plot";
import assert from "assert";

it("link(data, options) has the expected defaults", () => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3"});
  assert.strictEqual(link.data, undefined);
  assert.strictEqual(link.transform, undefined);
  assert.deepStrictEqual(Object.keys(link.channels), ["x1", "y1", "x2", "y2"]);
  assert.deepStrictEqual(Object.values(link.channels).map(c => c.value), ["0", "1", "2", "3"]);
  assert.deepStrictEqual(Object.values(link.channels).map(c => c.scale), ["x", "y", "x", "y"]);
  assert.strictEqual(link.fill, "none");
  assert.strictEqual(link.fillOpacity, undefined);
  assert.strictEqual(link.stroke, "currentColor");
  assert.strictEqual(link.strokeWidth, undefined);
  assert.strictEqual(link.strokeOpacity, undefined);
  assert.strictEqual(link.strokeLinejoin, undefined);
  assert.strictEqual(link.strokeLinecap, undefined);
  assert.strictEqual(link.strokeMiterlimit, 1);
  assert.strictEqual(link.strokeDasharray, undefined);
  assert.strictEqual(link.strokeDashoffset, undefined);
  assert.strictEqual(link.mixBlendMode, undefined);
  assert.strictEqual(link.shapeRendering, undefined);
});

it("link(data, {title}) specifies an optional title channel", () => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", title: "4"});
  const {title} = link.channels;
  assert.strictEqual(title.value, "4");
  assert.strictEqual(title.scale, undefined);
});

it("link(data, {stroke}) allows stroke to be a constant color", () => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "red"});
  assert.strictEqual(link.stroke, "red");
});

it("link(data, {stroke}) allows stroke to be null", () => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: null});
  assert.strictEqual(link.stroke, undefined);
});

it("link(data, {stroke}) allows stroke to be a variable color", () => {
  const link = Plot.link(undefined, {x1: "0", y1: "1", x2: "2", y2: "3", stroke: "4"});
  assert.strictEqual(link.stroke, undefined);
  const {stroke} = link.channels;
  assert.strictEqual(stroke.value, "4");
  assert.strictEqual(stroke.scale, "color");
});
