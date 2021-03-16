import * as Plot from "@observablehq/plot";
import {range} from "d3";
import tape from "tape-await";

/* eslint-disable no-sparse-arrays */
/* eslint-disable comma-dangle */
tape("movingMax computes a moving maximum", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const m1 = Plot.movingMaxX({k: 1, x: d => d});
  m1.transform(data, [range(data.length)]);
  test.deepEqual(m1.x.transform(), [ 0, 1, 2, 3, 4, 5 ]);
  const m2 = Plot.movingMaxX({k: 2, x: d => d});
  m2.transform(data, [range(data.length)]);
  test.deepEqual(m2.x.transform(), [ 1, 2, 3, 4, 5, ]);
  const m3 = Plot.movingMaxX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 2, 3, 4, 5, ]);
  const m4 = Plot.movingMaxX({k: 4, x: d => d});
  m4.transform(data, [range(data.length)]);
  test.deepEqual(m4.x.transform(), [ , 3, 4, 5, , ]);
});

tape("movingMax skips NaN", test => {
  const data = [1, 1, 1, NaN, 1, 1, 1, 1, 1, NaN, NaN, NaN, NaN, 1];
  const m3 = Plot.movingMaxX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, , , , 1, 1, 1, , , , , , ]);
});

tape("movingMax treats null as NaN", test => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, null, null, null, 1];
  const m3 = Plot.movingMaxX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, , , , 1, 1, 1, , , , , , ]);
});

tape("movingMax respects shift", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = Plot.movingMaxX({k: 3, x: d => d});
  mc.transform(data, [range(data.length)]);
  test.deepEqual(mc.x.transform(), [ , 2, 3, 4, 5, ]);
  const ml = Plot.movingMaxX({k: 3, shift: "leading", x: d => d});
  ml.transform(data, [range(data.length)]);
  test.deepEqual(ml.x.transform(), [ 2, 3, 4, 5, , ]);
  const mt = Plot.movingMaxX({k: 3, shift: "trailing", x: d => d});
  mt.transform(data, [range(data.length)]);
  test.deepEqual(mt.x.transform(), [ , , 2, 3, 4, 5 ]);
});

