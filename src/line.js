import {extent, group, sort} from "d3-array";
import {Frame} from "./frame.js";
import {Fragment} from "./mark/fragment.js";
import {RuleX, RuleY} from "./mark/rule.js";
import {LineIXYZ, LineXYZ} from "./mark/line.js";
import {inferType} from "./scale.js";

export function Line(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isValue(options)) options = {y: options};
  else if (a > 2) options = {x: options, y: A[2], z: A[3]};
  if (isValue(options.x)) options = {...options, x: {value: options.x}};
  if (isValue(options.y)) options = {...options, y: {value: options.y}};
  if (isValue(options.z)) options = {...options, z: {value: options.z}};
  if (isValue(options.fx)) options = {...options, fx: {value: options.fx}};
  if (isValue(options.fy)) options = {...options, fy: {value: options.fy}};
  if (isMissing(options.x)) options = {...options, x: {axis: false, ...options.x}};
  else if (isField(options.x)) options = {...options, x: field(options.x, "x")};
  if (isField(options.y)) options = {...options, y: field(options.y, "y")};
  if (isField(options.z)) options = {...options, z: field(options.z)};
  if (isField(options.fx)) options = {...options, fx: field(options.fx)};
  if (isField(options.fy)) options = {...options, fy: field(options.fy)};
  const {
    x: {value: xValue = (d, i) => i, zero: xZero = false} = {},
    y: {value: yValue = d => d, zero: yZero = false} = {},
    z: {value: zValue} = {},
    fx: {value: fxValue} = {},
    fy: {value: fyValue} = {}
  } = options;
  const X = typeof xValue === "function" ? Array.from(data, xValue) : xValue;
  const Y = typeof yValue === "function" ? Array.from(data, yValue) : yValue;
  const Z = typeof zValue === "function" ? Array.from(data, zValue) : zValue;
  const FX = typeof fxValue === "function" ? Array.from(data, fxValue) : fxValue;
  const FY = typeof fyValue === "function" ? Array.from(data, fyValue) : fyValue;
  const xDomain = inferDomain(X, options.x);
  const yDomain = inferDomain(Y, options.y);
  const fxDomain = options.fx && inferFacet(FX, options.fx);
  const fyDomain = options.fy && inferFacet(FY, options.fy);
  return Frame({
    height: 240,
    ...options,
    x: {domain: xDomain, ...options.x},
    y: {domain: yDomain, ...options.y},
    ...options.fx && {fx: {domain: fxDomain, ...options.fx}},
    ...options.fy && {fy: {domain: fyDomain, ...options.fy}},
    render: Fragment(
      ...xZero ? [RuleX(0)] : [],
      ...yZero ? [RuleY(0)] : [],
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

function isMissing(value) {
  return !value || value.value === undefined;
}

function isField(value) {
  return value && typeof value.value === "string";
}

function isValue(value) {
  return value && (["string", "function"].includes(typeof value) || isIterable(value));
}

function isIterable(value) {
  return value && ("length" in value || typeof value[Symbol.iterator] === "function");
}

function inferDomain(V, {
  zero = false,
  invert = false,
  domain,
  type = inferType(domain === undefined ? V : domain)
} = {}) {
  if (type === "band") throw new Error("band is not suited for lines; use point?");
  if (type === "point") {
    if (domain === undefined) domain = sort(V);
  } else {
    if (domain === undefined) domain = extent(V);
    if (zero) { // ignored for point scales
      const [min, max] = domain;
      if (min > 0 || max < 0) {
        if (max > 0) domain = [0, max];
        else domain = [min, 0];
      }
    }
  }
  return invert ? Array.from(domain).reverse() : domain;
}

function inferFacet(V, {
  invert = false,
  domain = sort(new Set(V))
} = {}) {
  return invert ? Array.from(domain).reverse() : domain;
}

function field({value, invert, ...options}, key) {
  return {
    value: d => d[value],
    label: !key ? value : `${
      key === "y" ? (invert ? "↓ " : "↑ "): ""}${
      value}${
      key === "x" ? (invert ? " ←" : " →"): ""}`,
    invert,
    ...options
  };
}
