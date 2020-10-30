import {extent} from "d3-array";
import {scalePoint, scaleBand, scaleLinear, scalePow, scaleLog, scaleSymlog, scaleTime, scaleUtc} from "d3-scale";

const types = new Map(Object.entries({
  point,
  band,
  linear,
  pow,
  log,
  symlog,
  time,
  utc
}));

export function auto(options = {}) {
  let typeOptions, {type, domain} = options;
  if (type === undefined) {
    type = "linear";
    if (domain !== undefined) {
      if (domain.length > 2) type = "point";
      else type = inferType(domain);
    }
  }
  if (!type) return [null, {axis: false, grid: false}];
  if (type == "sqrt") type = ["pow", 0.5]; // alias
  ([type, ...typeOptions] = typeof type === "string" ? [type] : type);
  if (!types.has(type)) throw new TypeError(`unknown type ${type}`);
  return types.get(type)(options, ...typeOptions);
}

export function point({
  domain = [],
  padding = 0.5,
  align = 0.5
} = {}) {
  return [
    scalePoint()
      .domain(domain)
      .align(align)
      .padding(padding),
    {labelAnchor: "center"}
  ];
}

export function band({
  domain = [],
  padding = 0,
  paddingInner = padding,
  paddingOuter = padding,
  align = 0.5
} = {}) {
  return [
    scaleBand()
      .domain(domain)
      .align(align)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter),
    {labelAnchor: "center"}
  ];
}

export function linear({
  domain = [0, 1]
} = {}) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  return [
    scaleLinear()
      .domain(domain)
  ];
}

export function pow({
  domain = [0, 1]
} = {}, exponent = 1) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  return [
    scalePow()
      .exponent(exponent)
      .domain(domain)
  ];
}

export function log({
  domain = [1, 10]
} = {}, base = 10) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  const [min, max] = extent(domain);
  if (min <= 0 && max >= 0) throw new Error("log domain cannot contain zero");
  return [
    scaleLog()
      .base(base)
      .domain(domain)
  ];
}

export function symlog({
  domain = [0, 1]
} = {}, constant = 1) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  return [
    scaleSymlog()
      .constant(constant)
      .domain(domain)
  ];
}

export function time({
  domain = [new Date(2020, 0, 1), new Date(2021, 0, 1)]
} = {}) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  return [
    scaleTime()
      .domain(domain)
  ];
}

export function utc({
  domain = [Date.UTC(2020, 0, 1), Date.UTC(2021, 0, 1)]
} = {}) {
  if (domain.length !== 2) throw new Error("invalid domain length");
  return [
    scaleUtc()
      .domain(domain)
  ];
}

export function inferType(domain) {
  let type = "linear";
  for (const value of domain) {
    if (value == null) continue;
    if (typeof value === "string") type = "point";
    else if (value instanceof Date) type = "utc";
    break;
  }
  return type;
}
