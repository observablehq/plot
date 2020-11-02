import {inferDomain, inferOrdinalDomain} from "./domain.js";
import {Facet} from "./facet.js";
import {Frame} from "./frame.js";
import {Fragment} from "./mark/fragment.js";
import {RuleX, RuleY} from "./mark/rule.js";
import {LineIXYZ} from "./mark/line.js";
import {channel, identity, indexOf, index, isBareValue, inferValues} from "./value.js";

const xImplied = {axis: false};
const xDefaults = {value: indexOf};
const yDefaults = {value: identity};

export function Line(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {y: options};
  else if (a > 2) options = {x: options, y: A[2], z: A[3]};
  const x = channel(options, "x", xDefaults, xImplied);
  const y = channel(options, "y", yDefaults);
  const z = channel(options, "z");
  const fx = channel(options, "fx");
  const fy = channel(options, "fy");
  const X = inferValues(data, x);
  const Y = inferValues(data, y);
  const Z = z && inferValues(data, z);
  const FX = fx && inferValues(data, fx);
  const FY = fy && inferValues(data, fy);
  const I = index(X);
  const xDomain = inferDomain(X, x);
  const yDomain = inferDomain(Y, y);
  const fxDomain = fx && inferOrdinalDomain(FX, fx);
  const fyDomain = fy && inferOrdinalDomain(FY, fy);
  const {line} = options;
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
      Facet(I, FX, FY, (I, x, y, d) => LineIXYZ(I, X, Y, Z, line)(x, y, d))
    )
  });
}
