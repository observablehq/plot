import * as Plot from "@observablehq/plot";
import {range} from "d3";
import tape from "tape-await";

/* eslint-disable no-sparse-arrays */
/* eslint-disable comma-dangle */
tape("window max computes a moving maximum", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const m1 = Plot.windowX({reduce: "max", k: 1, x: d => d});
  m1.transform(data, [range(data.length)]);
  test.deepEqual(m1.x.transform(), [ 0, 1, 2, 3, 4, 5 ]);
  const m2 = Plot.windowX({reduce: "max", k: 2, x: d => d});
  m2.transform(data, [range(data.length)]);
  test.deepEqual(m2.x.transform(), [ 1, 2, 3, 4, 5, ]);
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 2, 3, 4, 5, ]);
  const m4 = Plot.windowX({reduce: "max", k: 4, x: d => d});
  m4.transform(data, [range(data.length)]);
  test.deepEqual(m4.x.transform(), [ , 3, 4, 5, , ]);
});

tape("window max skips NaN", test => {
  const data = [1, 1, 1, NaN, 1, 1, 1, 1, 1, NaN, NaN, NaN, NaN, 1];
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN, ]);
});

tape("window max treats null as NaN", test => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, null, null, null, 1];
  const m3 = Plot.windowX({reduce: "max", k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, NaN, NaN, NaN, 1, 1, 1, NaN, NaN, NaN, NaN, NaN, ]);
});

tape("window max respects shift", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = Plot.windowX({reduce: "max", k: 3, x: d => d});
  mc.transform(data, [range(data.length)]);
  test.deepEqual(mc.x.transform(), [ , 2, 3, 4, 5, ]);
  const ml = Plot.windowX({reduce: "max", k: 3, shift: "leading", x: d => d});
  ml.transform(data, [range(data.length)]);
  test.deepEqual(ml.x.transform(), [ 2, 3, 4, 5, , ]);
  const mt = Plot.windowX({reduce: "max", k: 3, shift: "trailing", x: d => d});
  mt.transform(data, [range(data.length)]);
  test.deepEqual(mt.x.transform(), [ , , 2, 3, 4, 5 ]);
});

