import {inferDomain, inferOrdinalDomain, inferType} from "./domain.js";
import {Facet} from "./facet.js";
import {Frame} from "./frame.js";
import {BarIXXY, BarIXYY} from "./mark/bar.js";
import {Fragment} from "./mark/fragment.js";
import {RuleX, RuleY} from "./mark/rule.js";
import {channel, identity, indexOf, index, isBareValue, inferValues, sortedIndex} from "./value.js";

const xImplied = {type: "band", value: indexOf, axis: false};
const yDefaults = {value: identity};

export function Bar(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {y: options};
  else if (a > 2) options = {x: options, y: A[2], z: A[3]};
  let x = channel(options, "x", null, xImplied);
  let y = channel(options, "y", yDefaults);
  const z = channel(options, "z");
  const fx = channel(options, "fx");
  const fy = channel(options, "fy");
  const X = inferValues(data, x);
  const Y = inferValues(data, y);
  const Z = z && inferValues(data, z);
  x = {...x, type: inferType(X, x)};
  y = {...y, type: inferType(Y, y)};
  if (x.type === "point") x = {...x, type: "band"};
  if (y.type === "point") y = {...y, type: "band"};
  if (x.type !== "band" && y.type !== "band") throw new Error("missing band scale");
  if (x.type === "band" && y.type === "band") throw new Error("duplicate band scale");
  if (x.type === "band") x = {padding: 0.1, ...x}, y = {rules: [0], ...x};
  else y = {padding: 0.1, ...y}, x = {rules: [0], ...x};
  const zero = new Float64Array(X.length);
  const FX = fx && inferValues(data, fx);
  const FY = fy && inferValues(data, fy);
  const I = z ? sortedIndex(Z) : index(X);
  const xDomain = inferDomain(X, x);
  const yDomain = inferDomain(Y, y);
  const fxDomain = fx && inferOrdinalDomain(FX, fx);
  const fyDomain = fy && inferOrdinalDomain(FY, fy);
  const {bar} = options; // TODO Histogram uses rect?
  const Bar = x.type === "band" ? BarIXYY : BarIXXY;
  return Frame({
    height: 240,
    ...options,
    x: {domain: xDomain, ...x},
    y: {domain: yDomain, ...y},
    ...fx && {fx: {domain: fxDomain, ...fx}},
    ...fy && {fy: {domain: fyDomain, ...fy}},
    render: Fragment(
      ...x.rules ? Array.from(x.rules, RuleX) : [],
      ...y.rules ? Array.from(y.rules, RuleY) : [],
      Facet(I, FX, FY, (I, x, y, d) => Bar(I, X, zero, Y, bar)(x, y, d))
    )
  });
}
