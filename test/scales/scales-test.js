import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";
const {window} = new JSDOM("");
global.document = window.document;

it("plot(…).scales() exposes the plot’s scales", () =>{
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.strictEqual(typeof plot.scales, "function");
  const scales = plot.scales();
  assert.strictEqual(Object.entries(scales).length, 2);
  assert("x" in scales);
  assert("y" in scales);
});

it("plot(…).scales('x') exposes the plot’s x scale", () =>{
  const x = Plot.dot([1, 2], {x: d => d}).plot().scales('x');
  assert.deepStrictEqual(x.domain, [1, 2]);
  assert.deepStrictEqual(x.range, [20, 620]);
  assert.strictEqual(typeof x.interpolate, "function");
  assert.strictEqual(x.type, "linear");
  assert.strictEqual(x.clamp, undefined);
  assert.strictEqual(typeof x.scale, "function");
});

it("plot(…).scales('y') exposes the plot’s y scale", () =>{
  const y0 = Plot.dot([1, 2], {x: d => d}).plot().scales('y');
  assert.strictEqual(y0, undefined);
  const y = Plot.dot([1, 2], {y: d => d}).plot().scales('y');
  assert.deepStrictEqual(y.domain, [1, 2]);
  assert.deepStrictEqual(y.range, [380, 20]);
  assert.strictEqual(typeof y.interpolate, "function");
  assert.strictEqual(y.type, "linear");
  assert.strictEqual(y.clamp, undefined);
  assert.strictEqual(typeof y.scale, "function");
});

it("plot(…).scales('fx') exposes the plot’s fx scale", () =>{
  const fx0 = Plot.dot([1, 2], {x: d => d}).plot().scales('fx');
  assert.strictEqual(fx0, undefined);
  const data = [1, 2];
  const fx = Plot.dot(data, {y: d => d}).plot({facet: {data, x: data}}).scales('fx');
  assert.deepStrictEqual(fx.domain, [1, 2]);
  assert.deepStrictEqual(fx.range, [40, 620]);
  assert.strictEqual(typeof fx.interpolate, "undefined");
  assert.strictEqual(fx.type, "band");
  assert.strictEqual(fx.clamp, undefined);
  assert.strictEqual(typeof fx.scale, "function");
});

it("plot(…).scales('fy') exposes the plot’s fy scale", () =>{
  const fy0 = Plot.dot([1, 2], {x: d => d}).plot().scales('fy');
  assert.strictEqual(fy0, undefined);
  const data = [1, 2];
  const fy = Plot.dot(data, {y: d => d}).plot({facet: {data, y: data}}).scales('fy');
  assert.deepStrictEqual(fy.domain, [1, 2]);
  assert.deepStrictEqual(fy.range, [20, 380]);
  assert.strictEqual(typeof fy.interpolate, "undefined");
  assert.strictEqual(fy.type, "band");
  assert.strictEqual(fy.clamp, undefined);
  assert.strictEqual(typeof fy.scale, "function");
});

it("plot(…).scales('color') exposes a continuous color scale", () =>{
  const color0 = Plot.dot([1, 2], {x: d => d}).plot().scales('color');
  assert.strictEqual(color0, undefined);
  const data = [1, 2, 3, 4, 5];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot().scales('color');
  assert.deepStrictEqual(color.domain, [1, 5]);
  assert.deepStrictEqual(color.range, [0, 1]);
  assert.strictEqual(typeof color.interpolate, "function");
  assert.strictEqual(color.type, "linear");
  assert.strictEqual(color.clamp, undefined);
  assert.strictEqual(typeof color.scale, "function");
});

it("plot(…).scales('color') exposes an ordinal color scale", () =>{
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot().scales('color');
  assert.deepStrictEqual(color.domain, data);
  assert.deepStrictEqual(color.range, ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']);
  assert.strictEqual(typeof color.interpolate, "undefined");
  assert.strictEqual(color.type, "ordinal");
  assert.strictEqual(color.clamp, undefined);
  assert.strictEqual(typeof color.scale, "function");
});

it("plot(…).scales('r') exposes a radius scale", () =>{
  const r0 = Plot.dot([1, 2], {x: d => d}).plot().scales('r');
  assert.strictEqual(r0, undefined);
  const data = [1, 2, 3, 4, 9];
  const r = Plot.dot(data, {r: d => d}).plot().scales('r');
  assert.deepStrictEqual(r.domain, [0, 9]);
  assert.deepStrictEqual(r.range, [0, Math.sqrt(40.5)]);
  assert.strictEqual(typeof r.interpolate, "function");
  assert.strictEqual(r.type, "sqrt");
  assert.strictEqual(r.clamp, undefined);
  assert.strictEqual(typeof r.scale, "function");
});

it("plot(…).scales('opacity') exposes a linear scale", () =>{
  const opacity0 = Plot.dot([1, 2], {x: d => d}).plot().scales('opacity');
  assert.strictEqual(opacity0, undefined);
  const data = [1, 2, 3, 4, 9];
  const opacity = Plot.dot(data, {fillOpacity: d => d}).plot().scales('opacity');
  assert.deepStrictEqual(opacity.domain, [0, 9]);
  assert.deepStrictEqual(opacity.range, [0, 1]);
  assert.strictEqual(typeof opacity.interpolate, "function");
  assert.strictEqual(opacity.type, "linear");
  assert.strictEqual(opacity.clamp, undefined);
  assert.strictEqual(typeof opacity.scale, "function");
});

it("plot(…).scales expose inset domain", () =>{
  assert.deepStrictEqual(scaleOpt({inset: null}).range, [20, 620]);
  assert.deepStrictEqual(scaleOpt({inset: 7}).range, [27, 613]);
});

it("plot(…).scales expose clamp", () =>{
  assert.strictEqual(scaleOpt({clamp: false}).clamp, undefined);
  assert.strictEqual(scaleOpt({clamp: true}).clamp, true);
});

it("plot(…).scales expose rounded scales", () =>{
  assert.strictEqual(scaleOpt({round: false}).scale(Math.SQRT2), 144.26406871192853);
  assert.strictEqual(scaleOpt({round: true}).scale(Math.SQRT2), 144);
  assert.strictEqual(scaleOpt({round: true}).interpolate(0, 100)(Math.SQRT1_2), 71);
});

it("plot(…).scales expose label", () =>{
  assert.strictEqual(scaleOpt({}).label, "x →");
  assert.strictEqual(scaleOpt({label: "value"}).label, "value");
});

it("plot(…).scales expose color label", () =>{
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot().scales("color");
  assert.strictEqual(x.label, "x");
  const y = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot({color: {label: "y"}}).scales("color");
  assert.strictEqual(y.label, "y");
});

it("plot(…).scales expose radius label", () =>{
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot().scales("r");
  assert.strictEqual(x.label, "x");
  const r = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot({color: {label: "radius"}}).scales("color");
  assert.strictEqual(r.label, "radius");
});

function scaleOpt(x) {
  return Plot.dot([{x: 1}, {x: 2}, {x: 3}], {x: "x"}).plot({x}).scales("x");
}
