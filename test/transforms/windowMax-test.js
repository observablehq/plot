import * as Plot from "@observablehq/plot";
import {range} from "d3";
import assert from "assert";

/* eslint-disable no-sparse-arrays */
/* eslint-disable comma-dangle */
it("window max computes a moving maximum", () => {
  const data = [0, 1, 2, 3, 4, 5];
  const m1 = Plot.windowX({reduce: "max", k: 1, x: d => d});
  m1.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m1.x.transform(), [0, 1, 2, 3, 4, 5]);
  const m2 = Plot.windowX({reduce: "max", k: 2, x: d => d});
  m2.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m2.x.transform(), [1, 2, 3, 4, 5,, ]);
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m3.x.transform(), [, 2, 3, 4, 5,, ]);
  const m4 = Plot.windowX({reduce: "max", k: 4, x: d => d});
  m4.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m4.x.transform(), [, 3, 4, 5,,, ]);
});

it("window max skips NaN", () => {
  const data = [1, 1, 1, NaN, 1, 1, 1, 1, 1, NaN, NaN, NaN, NaN, 1];
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN,, ]);
});

it("window max treats null as NaN", () => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, null, null, null, 1];
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  assert.deepStrictEqual(m3.x.transform(), [, 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN,, ]);
});

it("window max respects anchor", () => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = Plot.windowX({reduce: "max", k: 3, anchor: "middle", x: d => d});
  mc.transform(data, [range(data.length)]);
  assert.deepStrictEqual(mc.x.transform(), [, 2, 3, 4, 5,, ]);
  const ml = Plot.windowX({reduce: "max", k: 3, anchor: "start", x: d => d});
  ml.transform(data, [range(data.length)]);
  assert.deepStrictEqual(ml.x.transform(), [2, 3, 4, 5,,, ]);
  const mt = Plot.windowX({reduce: "max", k: 3, anchor: "end", x: d => d});
  mt.transform(data, [range(data.length)]);
  assert.deepStrictEqual(mt.x.transform(), [,, 2, 3, 4, 5]);
});
