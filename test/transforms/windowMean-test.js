import * as Plot from "@observablehq/plot";
import {range} from "d3";
import tape from "tape-await";

/* eslint-disable no-sparse-arrays */
/* eslint-disable comma-dangle */
tape("movingAverage computes a moving average", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const m1 = Plot.windowX({k: 1, x: d => d});
  m1.transform(data, [range(data.length)]);
  test.deepEqual(m1.x.transform(), [ 0, 1, 2, 3, 4, 5 ]);
  const m2 = Plot.windowX({k: 2, x: d => d});
  m2.transform(data, [range(data.length)]);
  test.deepEqual(m2.x.transform(), [ 0.5, 1.5, 2.5, 3.5, 4.5, ]);
  const m3 = Plot.windowX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, 2, 3, 4, ]);
  const m4 = Plot.windowX({k: 4, x: d => d});
  m4.transform(data, [range(data.length)]);
  test.deepEqual(m4.x.transform(), [ , 1.5, 2.5, 3.5, , ]);
});

tape("movingAverage skips NaN", test => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, NaN, 1, 1, 1];
  const m3 = Plot.windowX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, , , , 1, 1, 1, , , , 1, ]);
});

tape("movingAverage treats null as NaN", test => {
  const data = [1, 1, 1, null, 1, 1, 1, 1, 1, null, 1, 1, 1];
  const m3 = Plot.windowX({k: 3, x: d => d});
  m3.transform(data, [range(data.length)]);
  test.deepEqual(m3.x.transform(), [ , 1, , , , 1, 1, 1, , , , 1, ]);
});

tape("movingAverage respects shift", test => {
  const data = [0, 1, 2, 3, 4, 5];
  const mc = Plot.windowX({k: 3, x: d => d});
  mc.transform(data, [range(data.length)]);
  test.deepEqual(mc.x.transform(), [ , 1, 2, 3, 4, ]);
  const ml = Plot.windowX({k: 3, shift: "leading", x: d => d});
  ml.transform(data, [range(data.length)]);
  test.deepEqual(ml.x.transform(), [1, 2, 3, 4, , ]);
  const mt = Plot.windowX({k: 3, shift: "trailing", x: d => d});
  mt.transform(data, [range(data.length)]);
  test.deepEqual(mt.x.transform(), [ , , 1, 2, 3, 4]);
});

