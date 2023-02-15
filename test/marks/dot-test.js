import * as Plot from "@observablehq/plot";
import assert from "assert";

it("dot() has the expected defaults", () => {
  const dot = Plot.dot();
  assert.strictEqual(dot.data, undefined);
  assert.strictEqual(dot.transform, undefined);
  assert.deepStrictEqual(Object.keys(dot.channels), ["x", "y"]);
  assert.deepStrictEqual(
    Object.values(dot.channels).map((c) =>
      Plot.valueof(
        [
          [1, 2],
          [3, 4]
        ],
        c.value
      )
    ),
    [
      [1, 3],
      [2, 4]
    ]
  );
  assert.deepStrictEqual(
    Object.values(dot.channels).map((c) => c.scale),
    ["x", "y"]
  );
  assert.strictEqual(dot.r, 3);
  assert.strictEqual(dot.fill, "none");
  assert.strictEqual(dot.fillOpacity, undefined);
  assert.strictEqual(dot.stroke, "currentColor");
  assert.strictEqual(dot.strokeWidth, 1.5);
  assert.strictEqual(dot.strokeOpacity, undefined);
  assert.strictEqual(dot.strokeLinejoin, undefined);
  assert.strictEqual(dot.strokeLinecap, undefined);
  assert.strictEqual(dot.strokeMiterlimit, undefined);
  assert.strictEqual(dot.strokeDasharray, undefined);
  assert.strictEqual(dot.strokeDashoffset, undefined);
  assert.strictEqual(dot.mixBlendMode, undefined);
  assert.strictEqual(dot.shapeRendering, undefined);
});

it("dot accepts undefined data", () => {
  Plot.dot({length: 1}).initialize();
});

it("dot(data, {r}) allows r to be a constant radius", () => {
  const dot = Plot.dot(undefined, {r: 42});
  assert.strictEqual(dot.r, 42);
});

it("dot(data, {r}) allows r to be a variable radius", () => {
  const dot = Plot.dot(undefined, {r: "x"});
  assert.strictEqual(dot.r, undefined);
  const {r} = dot.channels;
  assert.strictEqual(r.value, "x");
  assert.strictEqual(r.scale, "r");
});

it("dot(data, {title}) specifies an optional title channel", () => {
  const dot = Plot.dot(undefined, {title: "x"});
  const {title} = dot.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("dot(data, {fill}) allows fill to be a constant color", () => {
  const dot = Plot.dot(undefined, {fill: "red"});
  assert.strictEqual(dot.fill, "red");
});

it("dot(data, {fill}) allows fill to be null", () => {
  const dot = Plot.dot(undefined, {fill: null});
  assert.strictEqual(dot.fill, "none");
});

it("dot(data, {fill}) allows fill to be a variable color", () => {
  const dot = Plot.dot(undefined, {fill: "x"});
  assert.strictEqual(dot.fill, undefined);
  const {fill} = dot.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "auto");
});

it("dot(data, {fill}) defaults stroke to undefined if fill is not none", () => {
  assert.strictEqual(Plot.dot(undefined, {fill: "red"}).stroke, undefined);
  assert.strictEqual(Plot.dot(undefined, {fill: "x"}).stroke, undefined);
  assert.strictEqual(Plot.dot(undefined, {fill: "none"}).stroke, "currentColor");
});

it("dot(data, {stroke}) allows stroke to be a constant color", () => {
  const dot = Plot.dot(undefined, {stroke: "red"});
  assert.strictEqual(dot.stroke, "red");
});

it("dot(data, {stroke}) allows stroke to be null", () => {
  const dot = Plot.dot(undefined, {stroke: null});
  assert.strictEqual(dot.stroke, undefined);
});

it("dot(data, {stroke}) allows stroke to be a variable color", () => {
  const dot = Plot.dot(undefined, {stroke: "x"});
  assert.strictEqual(dot.stroke, undefined);
  const {stroke} = dot.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "auto");
});

it("dot(data, {stroke}) defaults strokeWidth to 1.5 if stroke is defined", () => {
  assert.strictEqual(Plot.dot(undefined, {stroke: "red"}).strokeWidth, 1.5);
  assert.strictEqual(Plot.dot(undefined, {stroke: "x"}).strokeWidth, 1.5);
  assert.strictEqual(Plot.dot(undefined, {stroke: null}).strokeWidth, undefined);
});
