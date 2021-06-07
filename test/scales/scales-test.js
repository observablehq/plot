import * as Plot from "@observablehq/plot";
import tape from "tape-await";
import {JSDOM} from "jsdom";
const {window} = new JSDOM("");
global.document = window.document;

tape("plot(…).scales exposes the plot’s scales", test => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  test.equal(typeof plot.scales, "object");
  const scales = plot.scales;
  test.equal(Object.entries(scales).length, 2);
  test.assert("x" in scales);
  test.assert("y" in scales);
});

tape("plot(…).scales.x exposes the plot’s x scale", test => {
  const x = Plot.dot([1, 2], {x: d => d}).plot().scales.x;
  test.deepEqual(x.domain, [1, 2]);
  test.deepEqual(x.range, [20, 620]);
  test.equal(typeof x.interpolate, "function");
  test.equal(x.type, "linear");
  test.equal(x.clamp, false);
  test.equal(typeof Plot.scale(x), "function");
});

tape("plot(…).scales.y exposes the plot’s y scale", test => {
  const y0 = Plot.dot([1, 2], {x: d => d}).plot().scales.y;
  test.equal(y0, undefined);
  const y = Plot.dot([1, 2], {y: d => d}).plot().scales.y;
  test.deepEqual(y.domain, [1, 2]);
  test.deepEqual(y.range, [380, 20]);
  test.equal(typeof y.interpolate, "function");
  test.equal(y.type, "linear");
  test.equal(y.clamp, false);
  test.equal(typeof Plot.scale(y), "function");
});

tape("plot(…).scales.fx exposes the plot’s fx scale", test => {
  const fx0 = Plot.dot([1, 2], {x: d => d}).plot().scales.fx;
  test.equal(fx0, undefined);
  const data = [1, 2];
  const fx = Plot.dot(data, {y: d => d}).plot({facet: {data, x: data}}).scales.fx;
  test.deepEqual(fx.domain, [1, 2]);
  test.deepEqual(fx.range, [40, 620]);
  test.equal(typeof fx.interpolate, "undefined");
  test.equal(fx.type, "band");
  test.equal(fx.clamp, undefined);
  test.equal(typeof Plot.scale(fx), "function");
});

tape("plot(…).scales.fy exposes the plot’s fy scale", test => {
  const fy0 = Plot.dot([1, 2], {x: d => d}).plot().scales.fy;
  test.equal(fy0, undefined);
  const data = [1, 2];
  const fy = Plot.dot(data, {y: d => d}).plot({facet: {data, y: data}}).scales.fy;
  test.deepEqual(fy.domain, [1, 2]);
  test.deepEqual(fy.range, [20, 380]);
  test.equal(typeof fy.interpolate, "undefined");
  test.equal(fy.type, "band");
  test.equal(fy.clamp, undefined);
  test.equal(typeof Plot.scale(fy), "function");
});

tape("plot(…).scales.color exposes a continuous color scale", test => {
  const color0 = Plot.dot([1, 2], {x: d => d}).plot().scales.color;
  test.equal(color0, undefined);
  const data = [1, 2, 3, 4, 5];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot().scales.color;
  test.deepEqual(color.domain, [1, 5]);
  test.deepEqual(color.range, [0, 1]);
  test.equal(typeof color.interpolate, "function");
  test.equal(color.type, "linear");
  test.equal(color.clamp, false);
  test.equal(typeof Plot.scale(color), "function");
});

tape("plot(…).scales.color exposes an ordinal color scale", test => {
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d}).plot().scales.color;
  test.deepEqual(color.domain, data);
  test.deepEqual(color.range, ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']);
  test.equal(typeof color.interpolate, "undefined");
  test.equal(color.type, "ordinal");
  test.equal(color.clamp, undefined);
  test.equal(typeof Plot.scale(color), "function");
});

tape("plot(…).scales.r exposes a radius scale", test => {
  const r0 = Plot.dot([1, 2], {x: d => d}).plot().scales.r;
  test.equal(r0, undefined);
  const data = [1, 2, 3, 4, 9];
  const r = Plot.dot(data, {r: d => d}).plot().scales.r;
  test.deepEqual(r.domain, [0, 9]);
  test.deepEqual(r.range, [0, Math.sqrt(40.5)]);
  test.equal(typeof r.interpolate, "function");
  test.equal(r.type, "sqrt");
  test.equal(r.clamp, false);
  test.equal(typeof Plot.scale(r), "function");
});

tape("plot(…).scales.opacity exposes a linear scale", test => {
  const opacity0 = Plot.dot([1, 2], {x: d => d}).plot().scales.opacity;
  test.equal(opacity0, undefined);
  const data = [1, 2, 3, 4, 9];
  const opacity = Plot.dot(data, {fillOpacity: d => d}).plot().scales.opacity;
  test.deepEqual(opacity.domain, [0, 9]);
  test.deepEqual(opacity.range, [0, 1]);
  test.equal(typeof opacity.interpolate, "function");
  test.equal(opacity.type, "linear");
  test.equal(opacity.clamp, false);
  test.equal(typeof Plot.scale(opacity), "function");
});

tape("plot(…).scales expose inset domain", test => {
  test.deepEqual(scaleOpt({inset: null}).range, [20, 620]);
  test.deepEqual(scaleOpt({inset: 7}).range, [27, 613]);
});

tape("plot(…).scales expose clamp", test => {
  test.equal(scaleOpt({clamp: false}).clamp, false);
  test.equal(scaleOpt({clamp: true}).clamp, true);
});

tape("plot(…).scales expose rounded scales", test => {
  test.equal(Plot.scale(scaleOpt({round: false}))(Math.SQRT2), 144.26406871192853);
  test.equal(Plot.scale(scaleOpt({round: true}))(Math.SQRT2), 144);
  test.equal(scaleOpt({round: true}).interpolate(0, 100)(Math.SQRT1_2), 71);
});

tape("plot(…).scales expose label", test => {
  test.equal(scaleOpt({}).label, "x →");
  test.equal(scaleOpt({label: "value"}).label, "value");
});

tape("plot(…).scales expose color label", test => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot().scales.color;
  test.equal(x.label, "x");
  const y = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot({color: {label: "y"}}).scales.color;
  test.equal(y.label, "y");
});

tape("plot(…).scales expose radius label", test => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot().scales.r;
  test.equal(x.label, "x");
  const r = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot({r: {label: "radius"}}).scales.r;
  test.equal(r.label, "radius");
});

function scaleOpt(x) {
  return Plot.dot([{x: 1}, {x: 2}, {x: 3}], {x: "x"}).plot({x}).scales.x;
}
