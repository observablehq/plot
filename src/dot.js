import {inferDomain, inferOrdinalDomain} from "./domain.js";
import {Facet} from "./facet.js";
import {Frame} from "./frame.js";
import {DotIXY} from "./mark/dot.js";
import {Fragment} from "./mark/fragment.js";
import {RuleX, RuleY} from "./mark/rule.js";
import {channel, index, inferValues} from "./value.js";

const xDefaults = {value: d => d[0]};
const yDefaults = {value: d => d[1]};

export function Dot(data, options = {}) {
  const A = arguments, a = A.length;
  if (a > 2) options = {x: options, y: A[2]};
  const x = channel(options, "x", xDefaults);
  const y = channel(options, "y", yDefaults);
  const fx = channel(options, "fx");
  const fy = channel(options, "fy");
  const X = inferValues(data, x);
  const Y = inferValues(data, y);
  const FX = fx && inferValues(data, fx);
  const FY = fy && inferValues(data, fy);
  const I = index(X);
  const xDomain = inferDomain(X, x);
  const yDomain = inferDomain(Y, y);
  const fxDomain = fx && inferOrdinalDomain(FX, fx);
  const fyDomain = fy && inferOrdinalDomain(FY, fy);
  const {dot} = options;
  return Frame({
    height: 640,
    ...options,
    x: {domain: xDomain, ...x},
    y: {domain: yDomain, ...y},
    ...fx && {fx: {domain: fxDomain, ...fx}},
    ...fy && {fy: {domain: fyDomain, ...fy}},
    render: Fragment(
      ...x.rules ? Array.from(x.rules, RuleX) : [],
      ...y.rules ? Array.from(y.rules, RuleY) : [],
      Facet(I, FX, FY, (I, x, y, d) => DotIXY(I, X, Y, dot)(x, y, d))
    )
  });
}
