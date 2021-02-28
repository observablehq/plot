import {InternMap} from "d3-array";
import {valueof} from "../mark.js";

export function stackX({x, y, ...options}) {
  const [transform, Y, x1, x2] = stack(y, x);
  return {...options, transform, y: Y, x1, x2};
}

export function stackY({x, y, ...options}) {
  const [transform, X, y1, y2] = stack(x, y);
  return {...options, transform, x: X, y1, y2};
}

// TODO configurable series order
function stack(x, y) {
  const [X, setX] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  return [
    data => {
      const X = setX(valueof(data, x));
      const Y = valueof(data, y);
      const n = X.length;
      const Y0 = new InternMap();
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));
      for (let i = 0; i < n; ++i) {
        const k = X[i];
        const y1 = Y1[i] = Y0.has(k) ? Y0.get(k) : 0;
        const y2 = Y2[i] = y1 + +Y[i];
        Y0.set(k, isNaN(y2) ? y1 : y2);
      }
      return data;
    },
    X,
    Y1,
    Y2
  ];
}

// Defines a channel whose values are lazily populated by calling the returned
// setter. If the given source is labeled, the label is propagated to the
// returned channel definition.
function lazyChannel(source) {
  let value;
  return [
    {
      transform() { return value; },
      label: typeof source === "string" ? source
        : source ? source.label
        : undefined
    },
    v => value = v
  ];
}
