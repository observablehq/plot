import * as Plot from "@observablehq/plot";
import assert from "assert";

it("barX() has the expected defaults", () => {
  const bar = Plot.barX();
  assert.strictEqual(bar.data, undefined);
  // assert.strictEqual(bar.transform, undefined);
  assert.deepStrictEqual(Object.keys(bar.channels), ["x1", "x2", "y"]);
  // assert.deepStrictEqual(Object.values(bar.channels).map(c => Plot.valueof([1, 2, 3], c.value)), [[0, 0, 0], [1, 2, 3]]);
  assert.deepStrictEqual(
    Object.values(bar.channels).map((c) => c.scale),
    ["x", "x", "y"]
  );
  assert.strictEqual(bar.fill, undefined);
  assert.strictEqual(bar.fillOpacity, undefined);
  assert.strictEqual(bar.stroke, undefined);
  assert.strictEqual(bar.strokeWidth, undefined);
  assert.strictEqual(bar.strokeOpacity, undefined);
  assert.strictEqual(bar.strokeLinejoin, undefined);
  assert.strictEqual(bar.strokeLinecap, undefined);
  assert.strictEqual(bar.strokeMiterlimit, undefined);
  assert.strictEqual(bar.strokeDasharray, undefined);
  assert.strictEqual(bar.strokeDashoffset, undefined);
  assert.strictEqual(bar.mixBlendMode, undefined);
  assert.strictEqual(bar.shapeRendering, undefined);
  assert.strictEqual(bar.insetTop, 0);
  assert.strictEqual(bar.insetRight, 0);
  assert.strictEqual(bar.insetBottom, 0);
  assert.strictEqual(bar.insetLeft, 0);
});

it("barX(data, {y}) uses a band scale", () => {
  const bar = Plot.barX(undefined, {y: "x"});
  assert.deepStrictEqual(Object.keys(bar.channels), ["x1", "x2", "y"]);
  assert.deepStrictEqual(
    Object.values(bar.channels).map((c) => c.scale),
    ["x", "x", "y"]
  );
  assert.strictEqual(bar.channels.y.type, "band");
  assert.strictEqual(bar.channels.y.value.label, "x");
});

it("barX(data, {title}) specifies an optional title channel", () => {
  const bar = Plot.barX(undefined, {title: "x"});
  const {title} = bar.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("barX(data, {fill}) allows fill to be a constant color", () => {
  const bar = Plot.barX(undefined, {fill: "red"});
  assert.strictEqual(bar.fill, "red");
});

it("barX(data, {fill}) allows fill to be null", () => {
  const bar = Plot.barX(undefined, {fill: null});
  assert.strictEqual(bar.fill, "none");
});

it("barX(data, {fill}) allows fill to be a variable color", () => {
  const bar = Plot.barX(undefined, {fill: "x"});
  assert.strictEqual(bar.fill, undefined);
  const {fill} = bar.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});

it("barX(data, {stroke}) allows stroke to be a constant color", () => {
  const bar = Plot.barX(undefined, {stroke: "red"});
  assert.strictEqual(bar.stroke, "red");
});

it("barX(data, {stroke}) allows stroke to be null", () => {
  const bar = Plot.barX(undefined, {stroke: null});
  assert.strictEqual(bar.stroke, undefined);
});

it("barX(data, {stroke}) allows stroke to be a variable color", () => {
  const bar = Plot.barX(undefined, {stroke: "x"});
  assert.strictEqual(bar.stroke, undefined);
  const {stroke} = bar.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("barX(data, {x, y}) defaults x1 to zero and x2 to x", () => {
  const bar = Plot.barX(undefined, {x: "0", y: "1"});
  const {x1} = bar.channels;
  // assert.strictEqual(x1.value, 0);
  assert.strictEqual(x1.scale, "x");
  const {x2} = bar.channels;
  assert.strictEqual(x2.value.label, "0");
  assert.strictEqual(x2.scale, "x");
  const {y} = bar.channels;
  assert.strictEqual(y.value.label, "1");
  assert.strictEqual(y.scale, "y");
});

it("barX(data, {shapeRendering}) allows shapeRendering to have a constant value", () => {
  const bar = Plot.barX(undefined, {shapeRendering: "crispEdges"});
  assert.strictEqual(bar.shapeRendering, "crispEdges");
});

it("barY() has the expected defaults", () => {
  const bar = Plot.barY();
  assert.strictEqual(bar.data, undefined);
  // assert.strictEqual(bar.transform, undefined);
  assert.deepStrictEqual(Object.keys(bar.channels), ["y1", "y2", "x"]);
  // assert.deepStrictEqual(Object.values(bar.channels).map(c => Plot.valueof([1, 2, 3], c.value)), [[0, 0, 0], [1, 2, 3]]);
  assert.deepStrictEqual(
    Object.values(bar.channels).map((c) => c.scale),
    ["y", "y", "x"]
  );
  assert.strictEqual(bar.fill, undefined);
  assert.strictEqual(bar.fillOpacity, undefined);
  assert.strictEqual(bar.stroke, undefined);
  assert.strictEqual(bar.strokeWidth, undefined);
  assert.strictEqual(bar.strokeOpacity, undefined);
  assert.strictEqual(bar.strokeLinejoin, undefined);
  assert.strictEqual(bar.strokeLinecap, undefined);
  assert.strictEqual(bar.strokeMiterlimit, undefined);
  assert.strictEqual(bar.strokeDasharray, undefined);
  assert.strictEqual(bar.strokeDashoffset, undefined);
  assert.strictEqual(bar.mixBlendMode, undefined);
  assert.strictEqual(bar.shapeRendering, undefined);
  assert.strictEqual(bar.insetTop, 0);
  assert.strictEqual(bar.insetRight, 0);
  assert.strictEqual(bar.insetBottom, 0);
  assert.strictEqual(bar.insetLeft, 0);
});

it("barY(data, {x}) uses a band scale", () => {
  const bar = Plot.barY(undefined, {x: "y"});
  assert.deepStrictEqual(Object.keys(bar.channels), ["y1", "y2", "x"]);
  assert.deepStrictEqual(
    Object.values(bar.channels).map((c) => c.scale),
    ["y", "y", "x"]
  );
  assert.strictEqual(bar.channels.x.type, "band");
  assert.strictEqual(bar.channels.x.value.label, "y");
});

it("barY(data, {title}) specifies an optional title channel", () => {
  const bar = Plot.barY(undefined, {title: "x"});
  const {title} = bar.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("barY(data, {fill}) allows fill to be a constant color", () => {
  const bar = Plot.barY(undefined, {fill: "red"});
  assert.strictEqual(bar.fill, "red");
});

it("barY(data, {fill}) allows fill to be null", () => {
  const bar = Plot.barY(undefined, {fill: null});
  assert.strictEqual(bar.fill, "none");
});

it("barY(data, {fill}) allows fill to be a variable color", () => {
  const bar = Plot.barY(undefined, {fill: "x"});
  assert.strictEqual(bar.fill, undefined);
  const {fill} = bar.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "color");
});

it("barY(data, {stroke}) allows stroke to be a constant color", () => {
  const bar = Plot.barY(undefined, {stroke: "red"});
  assert.strictEqual(bar.stroke, "red");
});

it("barY(data, {stroke}) allows stroke to be null", () => {
  const bar = Plot.barY(undefined, {stroke: null});
  assert.strictEqual(bar.stroke, undefined);
});

it("barY(data, {stroke}) allows stroke to be a variable color", () => {
  const bar = Plot.barY(undefined, {stroke: "x"});
  assert.strictEqual(bar.stroke, undefined);
  const {stroke} = bar.channels;
  assert.strictEqual(stroke.value, "x");
  assert.strictEqual(stroke.scale, "color");
});

it("barY(data, {x, y}) defaults y1 to zero and y2 to y", () => {
  const bar = Plot.barY(undefined, {x: "0", y: "1"});
  const {x} = bar.channels;
  assert.strictEqual(x.value.label, "0");
  assert.strictEqual(x.scale, "x");
  const {y1} = bar.channels;
  // assert.strictEqual(y1.value, 0);
  assert.strictEqual(y1.scale, "y");
  const {y2} = bar.channels;
  assert.strictEqual(y2.value.label, "1");
  assert.strictEqual(y2.scale, "y");
});

it("barY(data, {shapeRendering}) allows shapeRendering to have a constant value", () => {
  const bar = Plot.barY(undefined, {shapeRendering: "crispEdges"});
  assert.strictEqual(bar.shapeRendering, "crispEdges");
});
