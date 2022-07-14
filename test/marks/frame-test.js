import * as Plot from "@observablehq/plot";
import assert from "assert";

it("frame(options) has the expected defaults", () => {
  const frame = Plot.frame();
  assert.strictEqual(frame.data, undefined);
  assert.strictEqual(frame.transform, undefined);
  assert.deepStrictEqual(frame.channels, {});
  assert.strictEqual(frame.fill, "none");
  assert.strictEqual(frame.fillOpacity, undefined);
  assert.strictEqual(frame.stroke, "currentColor");
  assert.strictEqual(frame.strokeWidth, undefined);
  assert.strictEqual(frame.strokeOpacity, undefined);
  assert.strictEqual(frame.strokeLinejoin, undefined);
  assert.strictEqual(frame.strokeLinecap, undefined);
  assert.strictEqual(frame.strokeMiterlimit, undefined);
  assert.strictEqual(frame.strokeDasharray, undefined);
  assert.strictEqual(frame.strokeDashoffset, undefined);
  assert.strictEqual(frame.mixBlendMode, undefined);
  assert.strictEqual(frame.shapeRendering, undefined);
  assert.strictEqual(frame.insetTop, 0);
  assert.strictEqual(frame.insetRight, 0);
  assert.strictEqual(frame.insetBottom, 0);
  assert.strictEqual(frame.insetLeft, 0);
});

it("frame({fill}) allows fill to be a constant color", () => {
  const frame = Plot.frame({fill: "red"});
  assert.strictEqual(frame.fill, "red");
  assert.strictEqual(frame.stroke, undefined);
});

it("frame({stroke}) allows stroke to be a constant color", () => {
  const frame = Plot.frame({stroke: "red"});
  assert.strictEqual(frame.stroke, "red");
  assert.strictEqual(frame.fill, "none");
});
