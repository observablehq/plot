import * as Plot from "@observablehq/plot";
import assert from "assert";

it("tickX() has the expected defaults", () => {
  const tick = Plot.tickX();
  assert.strictEqual(tick.data, undefined);
  assert.strictEqual(tick.transform, undefined);
  assert.deepStrictEqual(Object.keys(tick.channels), ["x"]);
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => Plot.valueof([1, 2, 3], c.value)),
    [[1, 2, 3]]
  );
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => c.scale),
    ["x"]
  );
  assert.strictEqual(tick.fill, undefined);
  assert.strictEqual(tick.fillOpacity, undefined);
  assert.strictEqual(tick.stroke, "currentColor");
  assert.strictEqual(tick.strokeWidth, undefined);
  assert.strictEqual(tick.strokeOpacity, undefined);
  assert.strictEqual(tick.strokeLinejoin, undefined);
  assert.strictEqual(tick.strokeLinecap, undefined);
  assert.strictEqual(tick.strokeMiterlimit, undefined);
  assert.strictEqual(tick.strokeDasharray, undefined);
  assert.strictEqual(tick.strokeDashoffset, undefined);
  assert.strictEqual(tick.mixBlendMode, undefined);
  assert.strictEqual(tick.shapeRendering, undefined);
});

it("tickX(data, {y}) uses a band scale", () => {
  const tick = Plot.tickX(undefined, {y: "x"});
  assert.deepStrictEqual(Object.keys(tick.channels), ["x", "y"]);
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => c.scale),
    ["x", "y"]
  );
  assert.strictEqual(tick.channels.y.type, "band");
  assert.strictEqual(tick.channels.y.value, "x");
});

it("tickX(data, {title}) specifies an optional title channel", () => {
  const tick = Plot.tickX(undefined, {title: "x"});
  const {title} = tick.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("tickX(data, {stroke}) allows stroke to be a constant color", () => {
  const tick = Plot.tickX(undefined, {stroke: "red"});
  assert.strictEqual(tick.stroke, "red");
});

it("tickX(data, {stroke}) allows stroke to be null", () => {
  const tick = Plot.tickX(undefined, {stroke: null});
  assert.strictEqual(tick.stroke, undefined);
});

it("tickX(data, {stroke}) allows stroke to be a variable color", () => {
  const tick = Plot.tickX(undefined, {stroke: "x"});
  assert.strictEqual(tick.stroke, undefined);
  const {stroke} = tick.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "auto");
});

it("tickY() has the expected defaults", () => {
  const tick = Plot.tickY();
  assert.strictEqual(tick.data, undefined);
  assert.strictEqual(tick.transform, undefined);
  assert.deepStrictEqual(Object.keys(tick.channels), ["y"]);
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => Plot.valueof([1, 2, 3], c.value)),
    [[1, 2, 3]]
  );
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => c.scale),
    ["y"]
  );
  assert.strictEqual(tick.fill, undefined);
  assert.strictEqual(tick.fillOpacity, undefined);
  assert.strictEqual(tick.stroke, "currentColor");
  assert.strictEqual(tick.strokeWidth, undefined);
  assert.strictEqual(tick.strokeOpacity, undefined);
  assert.strictEqual(tick.strokeLinejoin, undefined);
  assert.strictEqual(tick.strokeLinecap, undefined);
  assert.strictEqual(tick.strokeMiterlimit, undefined);
  assert.strictEqual(tick.strokeDasharray, undefined);
  assert.strictEqual(tick.strokeDashoffset, undefined);
  assert.strictEqual(tick.mixBlendMode, undefined);
  assert.strictEqual(tick.shapeRendering, undefined);
});

it("tickY(data, {x}) uses a band scale", () => {
  const tick = Plot.tickY(undefined, {x: "y"});
  assert.deepStrictEqual(Object.keys(tick.channels), ["y", "x"]);
  assert.deepStrictEqual(
    Object.values(tick.channels).map((c) => c.scale),
    ["y", "x"]
  );
  assert.strictEqual(tick.channels.x.type, "band");
  assert.strictEqual(tick.channels.x.value, "y");
});

it("tickY(data, {title}) specifies an optional title channel", () => {
  const tick = Plot.tickY(undefined, {title: "x"});
  const {title} = tick.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("tickY(data, {stroke}) allows stroke to be a constant color", () => {
  const tick = Plot.tickY(undefined, {stroke: "red"});
  assert.strictEqual(tick.stroke, "red");
});

it("tickY(data, {stroke}) allows stroke to be null", () => {
  const tick = Plot.tickY(undefined, {stroke: null});
  assert.strictEqual(tick.stroke, undefined);
});

it("tickY(data, {stroke}) allows stroke to be a variable color", () => {
  const tick = Plot.tickY(undefined, {stroke: "x"});
  assert.strictEqual(tick.stroke, undefined);
  const {stroke} = tick.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "auto");
});
