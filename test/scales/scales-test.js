import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";
const {window} = new JSDOM("");
global.document = window.document;

it("plot(…).scales exposes the plot’s scales", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.strictEqual(typeof plot.scales, "object");
  const scales = plot.scales;
  assert.strictEqual(Object.entries(scales).length, 2);
  assert("x" in scales);
  assert("y" in scales);
});

it("plot(…).scales[key] is computed once", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert(plot.scales.x === plot.scales.x);
});

it("plot(…).scales[key] is computed lazily", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert(plot.scales.x === plot.scales.x);
});

it("plot(…).scales.x exposes the plot’s x scale", () => {
  const x = Plot.dot([1, 2], {x: d => d}).plot().scales.x;
  assert.deepStrictEqual(x.domain, [1, 2]);
  assert.deepStrictEqual(x.range, [20, 620]);
  assert.strictEqual(typeof x.interpolate, "function");
  assert.strictEqual(x.type, "linear");
  assert.strictEqual(x.clamp, false);
  assert.strictEqual(typeof Plot.scale(x), "function");
});

it("plot(…).scales.y exposes the plot’s y scale", () => {
  const y0 = Plot.dot([1, 2], {x: d => d}).plot().scales.y;
  assert.strictEqual(y0, undefined);
  const y = Plot.dot([1, 2], {y: d => d}).plot().scales.y;
  assert.deepStrictEqual(y.domain, [1, 2]);
  assert.deepStrictEqual(y.range, [380, 20]);
  assert.strictEqual(typeof y.interpolate, "function");
  assert.strictEqual(y.type, "linear");
  assert.strictEqual(y.clamp, false);
  assert.strictEqual(typeof Plot.scale(y), "function");
});

it("plot(…).scales.fx exposes the plot’s fx scale", () => {
  const fx0 = Plot.dot([1, 2], {x: d => d}).plot().scales.fx;
  assert.strictEqual(fx0, undefined);
  const data = [1, 2];
  const fx = Plot.dot(data, {y: d => d}).plot({facet: {data, x: data}}).scales.fx;
  assert.deepStrictEqual(fx.domain, [1, 2]);
  assert.deepStrictEqual(fx.range, [40, 620]);
  assert.strictEqual(typeof fx.interpolate, "undefined");
  assert.strictEqual(fx.type, "band");
  assert.strictEqual(fx.clamp, undefined);
  assert.strictEqual(typeof Plot.scale(fx), "function");
});

it("plot(…).scales.fy exposes the plot’s fy scale", () => {
  const fy0 = Plot.dot([1, 2], {x: d => d}).plot().scales.fy;
  assert.strictEqual(fy0, undefined);
  const data = [1, 2];
  const fy = Plot.dot(data, {y: d => d}).plot({facet: {data, y: data}}).scales.fy;
  assert.deepStrictEqual(fy.domain, [1, 2]);
  assert.deepStrictEqual(fy.range, [20, 380]);
  assert.strictEqual(typeof fy.interpolate, "undefined");
  assert.strictEqual(fy.type, "band");
  assert.strictEqual(fy.clamp, undefined);
  assert.strictEqual(typeof Plot.scale(fy), "function");
});

it("plot(…).scales.color exposes a continuous color scale", () => {
  const color0 = Plot.dot([1, 2], {x: d => d}).plot().scales.color;
  assert.strictEqual(color0, undefined);
  const data = [1, 2, 3, 4, 5];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot().scales.color;
  assert.deepStrictEqual(color.domain, [1, 5]);
  assert.deepStrictEqual(color.range, [0, 1]);
  assert.strictEqual(typeof color.interpolate, "function");
  assert.strictEqual(color.type, "linear");
  assert.strictEqual(color.clamp, false);
  assert.strictEqual(typeof Plot.scale(color), "function");
});

it("plot(…).scales.color exposes an ordinal color scale", () => {
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot({ color: { type: "ordinal" }}).scales.color;
  assert.deepStrictEqual(color.domain, data);
  assert.deepStrictEqual(color.range, ['rgb(35, 23, 27)', 'rgb(46, 229, 174)', 'rgb(254, 185, 39)', 'rgb(144, 12, 0)']);
  assert.strictEqual(typeof color.interpolate, "undefined");
  assert.strictEqual(color.type, "ordinal");
  assert.strictEqual(color.clamp, undefined);
  assert.strictEqual(typeof Plot.scale(color), "function");
});

it("plot(…).scales.color exposes a categorical color scale", () => {
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot({ color: { type: "categorical" }}).scales.color;
  assert.deepStrictEqual(color.domain, data);
  assert.deepStrictEqual(color.range, ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']);
  assert.strictEqual(typeof color.interpolate, "undefined");
  assert.strictEqual(color.type, "categorical");
  assert.strictEqual(color.clamp, undefined);
  assert.strictEqual(typeof Plot.scale(color), "function");
});

it("plot(…).scales.r exposes a radius scale", () => {
  const r0 = Plot.dot([1, 2], {x: d => d}).plot().scales.r;
  assert.strictEqual(r0, undefined);
  const data = [1, 2, 3, 4, 9];
  const r = Plot.dot(data, {r: d => d}).plot().scales.r;
  assert.deepStrictEqual(r.domain, [0, 9]);
  assert.deepStrictEqual(r.range, [0, Math.sqrt(40.5)]);
  assert.strictEqual(typeof r.interpolate, "function");
  assert.strictEqual(r.type, "sqrt");
  assert.strictEqual(r.clamp, false);
  assert.strictEqual(typeof Plot.scale(r), "function");
});

it("plot(…).scales.opacity exposes a linear scale", () => {
  const opacity0 = Plot.dot([1, 2], {x: d => d}).plot().scales.opacity;
  assert.strictEqual(opacity0, undefined);
  const data = [1, 2, 3, 4, 9];
  const opacity = Plot.dot(data, {fillOpacity: d => d}).plot().scales.opacity;
  assert.deepStrictEqual(opacity.domain, [0, 9]);
  assert.deepStrictEqual(opacity.range, [0, 1]);
  assert.strictEqual(typeof opacity.interpolate, "function");
  assert.strictEqual(opacity.type, "linear");
  assert.strictEqual(opacity.clamp, false);
  assert.strictEqual(typeof Plot.scale(opacity), "function");
});

it("plot(…).scales expose inset domain", () => {
  assert.deepStrictEqual(scaleOpt({inset: null}).range, [20, 620]);
  assert.deepStrictEqual(scaleOpt({inset: 7}).range, [27, 613]);
});

it("plot(…).scales expose clamp", () => {
  assert.strictEqual(scaleOpt({clamp: false}).clamp, false);
  assert.strictEqual(scaleOpt({clamp: true}).clamp, true);
});

it("plot(…).scales expose rounded scales", () => {
  assert.strictEqual(Plot.scale(scaleOpt({round: false}))(Math.SQRT2), 144.26406871192853);
  assert.strictEqual(Plot.scale(scaleOpt({round: true}))(Math.SQRT2), 144);
  assert.strictEqual(scaleOpt({round: true}).interpolate(0, 100)(Math.SQRT1_2), 71);
});

it("plot(…).scales expose label", () => {
  assert.strictEqual(scaleOpt({}).label, "x →");
  assert.strictEqual(scaleOpt({label: "value"}).label, "value");
});

it("plot(…).scales expose color label", () => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot().scales.color;
  assert.strictEqual(x.label, "x");
  const y = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot({color: {label: "y"}}).scales.color;
  assert.strictEqual(y.label, "y");
});

it("plot(…).scales expose radius label", () => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot().scales.r;
  assert.strictEqual(x.label, "x");
  const r = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot({r: {label: "radius"}}).scales.r;
  assert.strictEqual(r.label, "radius");
});

it("plot(…).scales expose pow exponent", () => {
  const x = Plot.dotX([]).plot({x: { type: "pow", exponent: 0.3 }}).scales.x;
  assert.strictEqual(x.type, "pow");
  assert.strictEqual(x.exponent, 0.3);
  const y = Plot.dotX([]).plot({x: { type: "sqrt" }}).scales.x;
  assert.strictEqual(y.type, "sqrt");
  assert.strictEqual(y.exponent, undefined);
});

it("plot(…).scales expose log base", () => {
  const x = Plot.dotX([]).plot({x: { type: "log", base: 2 }}).scales.x;
  assert.strictEqual(x.type, "log");
  assert.strictEqual(x.base, 2);
});

it("plot(…).scales expose symlog constant", () => {
  const x = Plot.dotX([]).plot({x: { type: "symlog", constant: 42 }}).scales.x;
  assert.strictEqual(x.type, "symlog");
  assert.strictEqual(x.constant, 42);
});

it("plot(…).scales expose align, paddingInner and paddingOuter", () => {
  const x = Plot.cellX(["A", "B"]).plot({x: { paddingOuter: -0.2, align: 1 }}).scales.x;
  assert.strictEqual(x.type, "band");
  assert.strictEqual(x.align, 1);
  assert.strictEqual(x.paddingInner, 0.1);
  assert.strictEqual(x.paddingOuter, -0.2);
});

it("plot(…).scales expose unexpected scale options", () => {
  const x = Plot.dotX([]).plot({x: { lala: 42, width: 420 }}).scales.x;
  assert.strictEqual(x.lala, 42);
  assert.strictEqual(x.width, 420);
});

function scaleOpt(x) {
  return Plot.dot([{x: 1}, {x: 2}, {x: 3}], {x: "x"}).plot({x}).scales.x;
}
