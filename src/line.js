import {group} from "d3-array";
import {inferDomain, inferOrdinalDomain} from "./domain.js";
import {Frame} from "./frame.js";
import {Fragment} from "./mark/fragment.js";
import {RuleX, RuleY} from "./mark/rule.js";
import {LineIXYZ, LineXYZ} from "./mark/line.js";
import {identity, index, isBareValue, inferValues, normalizeValue} from "./value.js";

export function Line(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {y: options};
  else if (a > 2) options = {x: options, y: A[2], z: A[3]};
  options = normalizeValue(options, "x", true);
  options = normalizeValue(options, "y");
  options = normalizeValue(options, "z");
  options = normalizeValue(options, "fx");
  options = normalizeValue(options, "fy");
  const {
    x: {value: xValue = index, rules: xRules} = {},
    y: {value: yValue = identity, rules: yRules} = {},
    z: {value: zValue} = {},
    fx: {value: fxValue} = {},
    fy: {value: fyValue} = {}
  } = options;
  const X = inferValues(data, xValue);
  const Y = inferValues(data, yValue);
  const Z = inferValues(data, zValue);
  const FX = inferValues(data, fxValue);
  const FY = inferValues(data, fyValue);
  const xDomain = inferDomain(X, options.x);
  const yDomain = inferDomain(Y, options.y);
  const fxDomain = options.fx && inferOrdinalDomain(FX, options.fx);
  const fyDomain = options.fy && inferOrdinalDomain(FY, options.fy);
  return Frame({
    height: 240,
    ...options,
    x: {domain: xDomain, ...options.x},
    y: {domain: yDomain, ...options.y},
    ...options.fx && {fx: {domain: fxDomain, ...options.fx}},
    ...options.fy && {fy: {domain: fyDomain, ...options.fy}},
    render: Fragment(
      ...xRules ? Array.from(xRules, RuleX) : [],
      ...yRules ? Array.from(yRules, RuleY) : [],
      options.fx && options.fy ? LineFXY(X, Y, Z, FX, FY, options.line)
        : options.fx ? LineFX(X, Y, Z, FX, options.line)
        : options.fy ? LineFY(X, Y, Z, FY, options.line)
        : LineXYZ(X, Y, Z, options.line)
    )
  });
}

function LineFX(X, Y, Z, FX, options) {
  const I = group(Uint32Array.from(X, (_, i) => i), i => FX[i]);
  return (x, y, d, fx) => LineIXYZ(I.get(fx), X, Y, Z, options)(x, y, d);
}

function LineFY(X, Y, Z, FY, options) {
  const I = group(Uint32Array.from(X, (_, i) => i), i => FY[i]);
  return (x, y, d, fx, fy) => LineIXYZ(I.get(fy), X, Y, Z, options)(x, y, d);
}

function LineFXY(X, Y, Z, FX, FY, options) {
  const I = group(Uint32Array.from(X, (_, i) => i), i => FX[i], i => FY[i]);
  return (x, y, d, fx, fy) => LineIXYZ(I.get(fx).get(fy), X, Y, Z, options)(x, y, d);
}
