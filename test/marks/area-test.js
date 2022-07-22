import * as Plot from "@observablehq/plot";
import {curveLinear, curveStep} from "d3";
import assert from "assert";

it("area(data, options) has the expected defaults", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1"});
  assert.strictEqual(area.data, undefined);
  // assert.strictEqual(area.transform, undefined);
  assert.deepStrictEqual(Object.keys(area.channels), ["x1", "y1"]);
  assert.deepStrictEqual(
    Object.values(area.channels).map((c) => c.value),
    ["0", "1"]
  );
  assert.deepStrictEqual(
    Object.values(area.channels).map((c) => c.scale),
    ["x", "y"]
  );
  assert.strictEqual(area.curve, curveLinear);
  assert.strictEqual(area.fill, undefined);
  assert.strictEqual(area.fillOpacity, undefined);
  assert.strictEqual(area.stroke, undefined);
  assert.strictEqual(area.strokeWidth, undefined);
  assert.strictEqual(area.strokeOpacity, undefined);
  assert.strictEqual(area.strokeLinejoin, undefined);
  assert.strictEqual(area.strokeLinecap, undefined);
  assert.strictEqual(area.strokeMiterlimit, undefined);
  assert.strictEqual(area.strokeDasharray, undefined);
  assert.strictEqual(area.strokeDashoffset, undefined);
  assert.strictEqual(area.mixBlendMode, undefined);
  assert.strictEqual(area.shapeRendering, undefined);
});

it("area(data, {x1, y1, y2}) specifies an optional y2 channel", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", y2: "2"});
  const {y2} = area.channels;
  assert.strictEqual(y2.value, "2");
  assert.strictEqual(y2.scale, "y");
});

it("area(data, {x1, x2, y1}) specifies an optional x2 channel", () => {
  const area = Plot.area(undefined, {x1: "0", x2: "1", y1: "2"});
  const {x2} = area.channels;
  assert.strictEqual(x2.value, "1");
  assert.strictEqual(x2.scale, "x");
});

it("area(data, {z}) specifies an optional z channel", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", z: "2"});
  const {z} = area.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("area(data, {title}) specifies an optional title channel", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", title: "2"});
  const {title} = area.channels;
  assert.strictEqual(title.value, "2");
  assert.strictEqual(title.scale, undefined);
});

it("area(data, {fill}) allows fill to be a constant color", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "red"});
  assert.strictEqual(area.fill, "red");
});

it("area(data, {fill}) allows fill to be null", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: null});
  assert.strictEqual(area.fill, "none");
});

it("area(data, {fill}) allows fill to be a variable color", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "x"});
  assert.strictEqual(area.fill, undefined);
  const {fill} = area.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});

it("area(data, {fill}) implies a default z channel if fill is variable", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "2", stroke: "3"}); // fill takes priority
  const {z} = area.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("area(data, {stroke}) allows stroke to be a constant color", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "red"});
  assert.strictEqual(area.stroke, "red");
});

it("area(data, {stroke}) allows stroke to be null", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: null});
  assert.strictEqual(area.stroke, undefined);
});

it("area(data, {stroke}) allows stroke to be a variable color", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "x"});
  assert.strictEqual(area.stroke, undefined);
  const {stroke} = area.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("area(data, {stroke}) implies a default z channel if stroke is variable", () => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "2"});
  const {z} = area.channels;
  assert.strictEqual(z.value, "2");
  assert.strictEqual(z.scale, undefined);
});

it("area(data, {curve}) specifies a named curve or function", () => {
  assert.strictEqual(Plot.area(undefined, {x1: "0", y1: "1", curve: "step"}).curve, curveStep);
  assert.strictEqual(Plot.area(undefined, {x1: "0", y1: "1", curve: curveStep}).curve, curveStep);
});

it("areaX(data, {x, y}) defaults x1 to zero, x2 to x, and y1 to y", () => {
  const area = Plot.areaX(undefined, {x: "0", y: "1"});
  const {x1} = area.channels;
  // assert.strictEqual(x1.value, 0);
  assert.strictEqual(x1.scale, "x");
  const {x2} = area.channels;
  assert.strictEqual(x2.value.label, "0");
  assert.strictEqual(x2.scale, "x");
  const {y1} = area.channels;
  assert.strictEqual(y1.value, "1");
  assert.strictEqual(y1.scale, "y");
});

it("areaY(data, {x, y}) defaults x1 to x, y1 to zero, and y2 to y", () => {
  const area = Plot.areaY(undefined, {x: "0", y: "1"});
  const {x1} = area.channels;
  assert.strictEqual(x1.value, "0");
  assert.strictEqual(x1.scale, "x");
  const {y1} = area.channels;
  // assert.strictEqual(y1.value, 0);
  assert.strictEqual(y1.scale, "y");
  const {y2} = area.channels;
  assert.strictEqual(y2.value.label, "1");
  assert.strictEqual(y2.scale, "y");
});
