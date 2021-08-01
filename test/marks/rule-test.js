import * as Plot from "@observablehq/plot";
import assert from "assert";

it("ruleX() has the expected defaults", () => {
  const rule = Plot.ruleX();
  assert.strictEqual(rule.data, undefined);
  assert.strictEqual(rule.transform, undefined);
  assert.deepStrictEqual(rule.channels.map(c => c.name), ["x"]);
  assert.deepStrictEqual(rule.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  assert.deepStrictEqual(rule.channels.map(c => c.scale), ["x"]);
  assert.strictEqual(rule.fill, undefined);
  assert.strictEqual(rule.fillOpacity, undefined);
  assert.strictEqual(rule.stroke, "currentColor");
  assert.strictEqual(rule.strokeWidth, undefined);
  assert.strictEqual(rule.strokeOpacity, undefined);
  assert.strictEqual(rule.strokeLinejoin, undefined);
  assert.strictEqual(rule.strokeLinecap, undefined);
  assert.strictEqual(rule.strokeMiterlimit, undefined);
  assert.strictEqual(rule.strokeDasharray, undefined);
  assert.strictEqual(rule.mixBlendMode, undefined);
  assert.strictEqual(rule.shapeRendering, undefined);
});

it("ruleX(data, {title}) specifies an optional title channel", () => {
  const rule = Plot.ruleX(undefined, {title: "x"});
  const title = rule.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("ruleX(data, {stroke}) allows stroke to be a constant color", () => {
  const rule = Plot.ruleX(undefined, {stroke: "red"});
  assert.strictEqual(rule.stroke, "red");
});

it("ruleX(data, {stroke}) allows stroke to be null", () => {
  const rule = Plot.ruleX(undefined, {stroke: null});
  assert.strictEqual(rule.stroke, undefined);
});

it("ruleX(data, {stroke}) allows stroke to be a variable color", () => {
  const rule = Plot.ruleX(undefined, {stroke: "x"});
  assert.strictEqual(rule.stroke, undefined);
  const stroke = rule.channels.find(c => c.name === "stroke");
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("ruleX(data, {x, y}) specifies y1 = zero, y2 = y", () => {
  const rule = Plot.ruleX(undefined, {x: "0", y: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  assert.strictEqual(y1.value, 0);
  assert.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  assert.strictEqual(y2.value, "1");
  assert.strictEqual(y2.scale, "y");
});

it("ruleX(data, {x, y1}) specifies y1 = zero, y2 = y1", () => {
  const rule = Plot.ruleX(undefined, {x: "0", y1: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  assert.strictEqual(y1.value, 0);
  assert.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  assert.strictEqual(y2.value, "1");
  assert.strictEqual(y2.scale, "y");
});

it("ruleX(data, {x, y2}) specifies y1 = zero, y2 = y2", () => {
  const rule = Plot.ruleX(undefined, {x: "0", y2: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  assert.strictEqual(y1.value, 0);
  assert.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  assert.strictEqual(y2.value, "1");
  assert.strictEqual(y2.scale, "y");
});

it("ruleX(data, {x, y1, y2}) specifies x, y1, y2", () => {
  const rule = Plot.ruleX(undefined, {x: "0", y1: "1", y2: "2"});
  const x = rule.channels.find(c => c.name === "x");
  assert.strictEqual(x.value, "0");
  assert.strictEqual(x.scale, "x");
  const y1 = rule.channels.find(c => c.name === "y1");
  assert.strictEqual(y1.value, "1");
  assert.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  assert.strictEqual(y2.value, "2");
  assert.strictEqual(y2.scale, "y");
});

it("ruleY() has the expected defaults", () => {
  const rule = Plot.ruleY();
  assert.strictEqual(rule.data, undefined);
  assert.strictEqual(rule.transform, undefined);
  assert.deepStrictEqual(rule.channels.map(c => c.name), ["y"]);
  assert.deepStrictEqual(rule.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  assert.deepStrictEqual(rule.channels.map(c => c.scale), ["y"]);
  assert.strictEqual(rule.fill, undefined);
  assert.strictEqual(rule.fillOpacity, undefined);
  assert.strictEqual(rule.stroke, "currentColor");
  assert.strictEqual(rule.strokeWidth, undefined);
  assert.strictEqual(rule.strokeOpacity, undefined);
  assert.strictEqual(rule.strokeLinejoin, undefined);
  assert.strictEqual(rule.strokeLinecap, undefined);
  assert.strictEqual(rule.strokeMiterlimit, undefined);
  assert.strictEqual(rule.strokeDasharray, undefined);
  assert.strictEqual(rule.mixBlendMode, undefined);
  assert.strictEqual(rule.shapeRendering, undefined);
});

it("ruleY(data, {title}) specifies an optional title channel", () => {
  const rule = Plot.ruleY(undefined, {title: "x"});
  const title = rule.channels.find(c => c.name === "title");
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("ruleY(data, {stroke}) allows stroke to be a constant color", () => {
  const rule = Plot.ruleY(undefined, {stroke: "red"});
  assert.strictEqual(rule.stroke, "red");
});

it("ruleY(data, {stroke}) allows stroke to be null", () => {
  const rule = Plot.ruleY(undefined, {stroke: null});
  assert.strictEqual(rule.stroke, undefined);
});

it("ruleY(data, {stroke}) allows stroke to be a variable color", () => {
  const rule = Plot.ruleY(undefined, {stroke: "x"});
  assert.strictEqual(rule.stroke, undefined);
  const stroke = rule.channels.find(c => c.name === "stroke");
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("ruleY(data, {x, y}) specifies x1 = zero, x2 = x", () => {
  const rule = Plot.ruleY(undefined, {x: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  assert.strictEqual(x1.value, 0);
  assert.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  assert.strictEqual(x2.value, "0");
  assert.strictEqual(x2.scale, "x");
});

it("ruleY(data, {y, x1}) specifies x1 = zero, x2 = x1", () => {
  const rule = Plot.ruleY(undefined, {x1: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  assert.strictEqual(x1.value, 0);
  assert.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  assert.strictEqual(x2.value, "0");
  assert.strictEqual(x2.scale, "x");
});

it("ruleY(data, {y, x2}) specifies x1 = zero, x2 = x2", () => {
  const rule = Plot.ruleY(undefined, {x2: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  assert.strictEqual(x1.value, 0);
  assert.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  assert.strictEqual(x2.value, "0");
  assert.strictEqual(x2.scale, "x");
});

it("ruleY(data, {x1, x2, y}) specifies x1, x2, y", () => {
  const rule = Plot.ruleY(undefined, {x1: "0", x2: "1", y: "2"});
  const x1 = rule.channels.find(c => c.name === "x1");
  assert.strictEqual(x1.value, "0");
  assert.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  assert.strictEqual(x2.value, "1");
  assert.strictEqual(x2.scale, "x");
  const y = rule.channels.find(c => c.name === "y");
  assert.strictEqual(y.value, "2");
  assert.strictEqual(y.scale, "y");
});
