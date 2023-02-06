import * as Plot from "@observablehq/plot";
import {curveStep} from "d3";
import assert from "assert";

it("line() has the expected defaults", () => {
  const line = Plot.line();
  assert.strictEqual(line.data, undefined);
  assert.strictEqual(line.transform, undefined);
  assert.deepStrictEqual(Object.keys(line.channels), ["x", "y"]);
  assert.deepStrictEqual(
    Object.values(line.channels).map((c) =>
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
    Object.values(line.channels).map((c) => c.scale),
    ["x", "y"]
  );
  assert.strictEqual(line.curve.name, "curveAuto");
  assert.strictEqual(line.fill, "none");
  assert.strictEqual(line.fillOpacity, undefined);
  assert.strictEqual(line.stroke, "currentColor");
  assert.strictEqual(line.strokeWidth, 1.5);
  assert.strictEqual(line.strokeOpacity, undefined);
  assert.strictEqual(line.strokeLinejoin, "round");
  assert.strictEqual(line.strokeLinecap, "round");
  assert.strictEqual(line.strokeMiterlimit, undefined);
  assert.strictEqual(line.strokeDasharray, undefined);
  assert.strictEqual(line.strokeDashoffset, undefined);
  assert.strictEqual(line.mixBlendMode, undefined);
  assert.strictEqual(line.shapeRendering, undefined);
});

it("line(data, {z}) specifies an optional z channel", () => {
  const line = Plot.line(undefined, {z: "2"});
  const {z} = line.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("line(data, {title}) specifies an optional title channel", () => {
  const line = Plot.line(undefined, {title: "2"});
  const {title} = line.channels;
  assert.strictEqual(title.value, "2");
  assert.strictEqual(title.scale, undefined);
});

it("line(data, {fill}) allows fill to be a constant color", () => {
  const line = Plot.line(undefined, {fill: "red"});
  assert.strictEqual(line.fill, "red");
});

it("line(data, {fill}) allows fill to be null", () => {
  const line = Plot.line(undefined, {fill: null});
  assert.strictEqual(line.fill, "none");
});

it("line(data, {fill}) allows fill to be a variable color", () => {
  const line = Plot.line(undefined, {fill: "x"});
  assert.strictEqual(line.fill, undefined);
  const {fill} = line.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});

it("line(data, {fill}) implies a default z channel if fill is variable", () => {
  const line = Plot.line(undefined, {fill: "2"});
  const {z} = line.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("line(data, {stroke}) allows stroke to be a constant color", () => {
  const line = Plot.line(undefined, {stroke: "red"});
  assert.strictEqual(line.stroke, "red");
});

it("line(data, {stroke}) allows stroke to be null", () => {
  const line = Plot.line(undefined, {stroke: null});
  assert.strictEqual(line.stroke, undefined);
});

it("line(data, {stroke}) implies no stroke width if stroke is null", () => {
  const line = Plot.line(undefined, {stroke: null});
  assert.strictEqual(line.strokeWidth, undefined);
});

it("line(data, {stroke}) allows stroke to be a variable color", () => {
  const line = Plot.line(undefined, {stroke: "x", fill: "3"}); // stroke takes priority
  assert.strictEqual(line.stroke, undefined);
  const {stroke} = line.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("line(data, {stroke}) implies a default z channel if stroke is variable", () => {
  const line = Plot.line(undefined, {stroke: "2"});
  const {z} = line.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("line(data, {curve}) specifies a named curve or function", () => {
  assert.strictEqual(Plot.line(undefined, {curve: "step"}).curve, curveStep);
  assert.strictEqual(Plot.line(undefined, {curve: curveStep}).curve, curveStep);
});
