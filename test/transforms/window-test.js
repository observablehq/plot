import * as Plot from "@observablehq/plot";
import {range} from "d3";
import assert from "assert";

function applyTransform(options, data) {
  options.transform(data, [Uint32Array.from(data, (_, i) => i)]);
  return options;
}

it(`windowX(options) is equivalent to mapX(window(options), options)`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX({k: 2, x: d => d}), data);
  const m2 = applyTransform(Plot.mapX(Plot.window({k: 2}), {x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), m2.x.transform());
});

it(`windowY(options) is equivalent to mapY(window(options), options)`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowY({k: 2, y: d => d}), data);
  const m2 = applyTransform(Plot.mapY(Plot.window({k: 2}), {y: d => d}), data);
  assert.deepStrictEqual(m1.y.transform(), m2.y.transform());
});

it(`windowX(k, options) is equivalent to windowX({k, anchor: "middle", reduce: "mean", ...options})`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX(2, {x: d => d}), data);
  const m2 = applyTransform(Plot.windowX({k: 2, anchor: "middle", reduce: "mean", x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), m2.x.transform());
});

it(`windowX({k, strict: true}, options) computes a moving average of window size k`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX({k: 1, strict: true}, {x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = applyTransform(Plot.windowX({k: 2, strict: true}, {x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [0.5, 1.5, 2.5, 3.5, 4.5,, ]);
  const m3 = applyTransform(Plot.windowX({k: 3, strict: true}, {x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 1, 2, 3, 4,, ]);
  const m4 = applyTransform(Plot.windowX({k: 4, strict: true}, {x: d => d}), data);
  assert.deepStrictEqual(m4.x.transform(), [, 1.5, 2.5, 3.5,,, ]);
});

it(`windowX({k, strict: true}) produces NaN if the current window contains NaN`, () => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, NaN, 1, 1, 1];
  const m1 = applyTransform(Plot.windowX({k: 1, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [1, 1, 1, NaN, 1, 1, 1, 1, 1, NaN, 1, 1, 1]);
  const m2 = applyTransform(Plot.windowX({k: 2, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [1, 1, NaN, NaN, 1, 1, 1, 1, NaN, NaN, 1, 1,, ]);
  const m3 = applyTransform(Plot.windowX({k: 3, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, 1,, ]);
});

it(`windowX({k, strict: true}) treats null as NaN`, () => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, 1, 1, 1];
  const m3 = applyTransform(Plot.windowX({k: 3, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, 1,, ]);
});

it(`windowX({k, strict: true, anchor}) respects the given anchor`, () => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = applyTransform(Plot.windowX({k: 3, strict: true, anchor: "middle", x: d => d}), data);
  assert.deepStrictEqual(mc.x.transform(), [, 1, 2, 3, 4,, ]);
  const ml = applyTransform(Plot.windowX({k: 3, strict: true, anchor: "start", x: d => d}), data);
  assert.deepStrictEqual(ml.x.transform(), [1, 2, 3, 4,,, ]);
  const mt = applyTransform(Plot.windowX({k: 3, strict: true, anchor: "end", x: d => d}), data);
  assert.deepStrictEqual(mt.x.transform(), [,, 1, 2, 3, 4]);
});

it(`windowX(k) truncates the window at the start and end`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX(1, {x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = applyTransform(Plot.windowX(2, {x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [0.5, 1.5, 2.5, 3.5, 4.5, 5]);
  const m3 = applyTransform(Plot.windowX(3, {x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [0.5, 1, 2, 3, 4, 4.5]);
  const m4 = applyTransform(Plot.windowX(4, {x: d => d}), data);
  assert.deepStrictEqual(m4.x.transform(), [1, 1.5, 2.5, 3.5, 4, 4.5]);
});

it(`windowX({k, anchor: "start"}) truncates the window at the end`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX({k: 1, anchor: "start"}, {x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = applyTransform(Plot.windowX({k: 2, anchor: "start"}, {x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [0.5, 1.5, 2.5, 3.5, 4.5, 5]);
  const m3 = applyTransform(Plot.windowX({k: 3, anchor: "start"}, {x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [1, 2, 3, 4, 4.5, 5]);
  const m4 = applyTransform(Plot.windowX({k: 4, anchor: "start"}, {x: d => d}), data);
  assert.deepStrictEqual(m4.x.transform(), [1.5, 2.5, 3.5, 4, 4.5, 5]);
});

it(`windowX({k, anchor: "end"}) truncates the window at the start`, () => {
  const data = range(6);
  const m1 = applyTransform(Plot.windowX({k: 1, anchor: "end"}, {x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = applyTransform(Plot.windowX({k: 2, anchor: "end"}, {x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [0, 0.5, 1.5, 2.5, 3.5, 4.5]);
  const m3 = applyTransform(Plot.windowX({k: 3, anchor: "end"}, {x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [0, 0.5, 1, 2, 3, 4]);
  const m4 = applyTransform(Plot.windowX({k: 4, anchor: "end"}, {x: d => d}), data);
  assert.deepStrictEqual(m4.x.transform(), [0, 0.5, 1, 1.5, 2.5, 3.5]);
});

it(`windowX(k) handles k being bigger than the data size`, () => {
  const data = range(6);
  const m3 = applyTransform(Plot.windowX(3, {x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [0.5, 1, 2, 3, 4, 4.5]);
  const m5 = applyTransform(Plot.windowX(5, {x: d => d}), data);
  assert.deepStrictEqual(m5.x.transform(), [1, 1.5, 2, 3, 3.5, 4]);
  const m6 = applyTransform(Plot.windowX(6, {x: d => d}), data);
  assert.deepStrictEqual(m6.x.transform(), [1.5, 2, 2.5, 3, 3.5, 4]);
  const m7 = applyTransform(Plot.windowX(7, {x: d => d}), data);
  assert.deepStrictEqual(m7.x.transform(), [1.5, 2, 2.5, 2.5, 3, 3.5]);
  const m8 = applyTransform(Plot.windowX(8, {x: d => d}), data);
  assert.deepStrictEqual(m8.x.transform(), [2, 2.5, 2.5, 2.5, 3, 3.5]);
  const m9 = applyTransform(Plot.windowX(9, {x: d => d}), data);
  assert.deepStrictEqual(m9.x.transform(), [2, 2.5, 2.5, 2.5, 2.5, 3]);
  const m10 = applyTransform(Plot.windowX(10, {x: d => d}), data);
  assert.deepStrictEqual(m10.x.transform(), [2.5, 2.5, 2.5, 2.5, 2.5, 3]);
  const m11 = applyTransform(Plot.windowX(11, {x: d => d}), data);
  assert.deepStrictEqual(m11.x.transform(), [2.5, 2.5, 2.5, 2.5, 2.5, 2.5]);
});

it(`windowX({reduce: "max", k, strict: true}) computes a moving maximum of window size k`, () => {
  const data = [0, 1, 2, 3, 4, 5];
  const m1 = applyTransform(Plot.windowX({reduce: "max", k: 1, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = applyTransform(Plot.windowX({reduce: "max", k: 2, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m2.x.transform(), [1, 2, 3, 4, 5,, ]);
  const m3 = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 2, 3, 4, 5,, ]);
  const m4 = applyTransform(Plot.windowX({reduce: "max", k: 4, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m4.x.transform(), [, 3, 4, 5,,, ]);
});

it(`windowX({reduce: "max", k, strict: true}) produces NaN if the current window contains NaN`, () => {
  const data = [1, 1, 1, NaN, 1, 1, 1, 1, 1, NaN, NaN, NaN, NaN, 1];
  const m3 = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN,, ]);
});

it(`windowX({reduce: "max", k, strict: true}) treats null as NaN`, () => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, null, null, null, 1];
  const m3 = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, x: d => d}), data);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN,, ]);
});

it(`windowX({reduce: "max", k, strict: true, anchor}) respects the given anchor`, () => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, anchor: "middle", x: d => d}), data);
  assert.deepStrictEqual(mc.x.transform(), [, 2, 3, 4, 5,, ]);
  const ml = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, anchor: "start", x: d => d}), data);
  assert.deepStrictEqual(ml.x.transform(), [2, 3, 4, 5,,, ]);
  const mt = applyTransform(Plot.windowX({reduce: "max", k: 3, strict: true, anchor: "end", x: d => d}), data);
  assert.deepStrictEqual(mt.x.transform(), [,, 2, 3, 4, 5]);
});
