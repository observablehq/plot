import {
  descending,
  interpolateNumber,
  interpolateRgb,
  piecewise,
  scaleDiverging,
  scaleDivergingLog,
  scaleDivergingPow,
  scaleDivergingSymlog
} from "d3";
import {negative, positive} from "../defined.js";
import {arrayify} from "../options.js";
import {warn} from "../warnings.js";
import {color, registry} from "./index.js";
import {flip, inferDomain, interpolatePiecewise, maybeInterpolator} from "./quantitative.js";
import {quantitativeScheme} from "./schemes.js";

function createScaleD(
  key,
  scale,
  transform,
  channels,
  {
    type,
    nice,
    clamp,
    domain = inferDomain(channels),
    unknown,
    pivot = 0,
    scheme,
    range,
    symmetric = true,
    interpolate = registry.get(key) === color
      ? scheme == null && range !== undefined
        ? interpolateRgb
        : quantitativeScheme(scheme !== undefined ? scheme : "rdbu")
      : interpolateNumber,
    reverse
  }
) {
  pivot = +pivot;
  domain = arrayify(domain);
  let [min, max] = domain;
  if (domain.length > 2) warn(`Warning: the diverging ${key} scale domain contains extra elements.`);

  if (descending(min, max) < 0) ([min, max] = [max, min]), (reverse = !reverse);
  min = Math.min(min, pivot);
  max = Math.max(max, pivot);

  // Sometimes interpolate is a named interpolator, such as "lab" for Lab color
  // space. Other times interpolate is a function that takes two arguments and
  // is used in conjunction with the range. And other times the interpolate
  // function is a “fixed” interpolator on the [0, 1] interval, as when a
  // color scheme such as interpolateRdBu is used.
  if (typeof interpolate !== "function") {
    interpolate = maybeInterpolator(interpolate);
  }

  // If an explicit range is specified, promote it to a piecewise interpolator.
  if (range !== undefined) {
    interpolate =
      interpolate.length === 1 ? interpolatePiecewise(interpolate)(...range) : piecewise(interpolate, range);
  }

  // Reverse before normalization.
  if (reverse) interpolate = flip(interpolate);

  // Normalize the interpolator for symmetric difference around the pivot.
  if (symmetric) {
    const mid = transform.apply(pivot);
    const mindelta = mid - transform.apply(min);
    const maxdelta = transform.apply(max) - mid;
    if (mindelta < maxdelta) min = transform.invert(mid - maxdelta);
    else if (mindelta > maxdelta) max = transform.invert(mid + mindelta);
  }

  scale.domain([min, pivot, max]).unknown(unknown).interpolator(interpolate);
  if (clamp) scale.clamp(clamp);
  if (nice) scale.nice(nice);
  return {type, domain: [min, max], pivot, interpolate, scale};
}

export function createScaleDiverging(key, channels, options) {
  return createScaleD(key, scaleDiverging(), transformIdentity, channels, options);
}

export function createScaleDivergingSqrt(key, channels, options) {
  return createScaleDivergingPow(key, channels, {...options, exponent: 0.5});
}

export function createScaleDivergingPow(key, channels, {exponent = 1, ...options}) {
  return createScaleD(key, scaleDivergingPow().exponent((exponent = +exponent)), transformPow(exponent), channels, {
    ...options,
    type: "diverging-pow"
  });
}

export function createScaleDivergingLog(
  key,
  channels,
  {base = 10, pivot = 1, domain = inferDomain(channels, pivot < 0 ? negative : positive), ...options}
) {
  return createScaleD(key, scaleDivergingLog().base((base = +base)), transformLog, channels, {
    domain,
    pivot,
    ...options
  });
}

export function createScaleDivergingSymlog(key, channels, {constant = 1, ...options}) {
  return createScaleD(
    key,
    scaleDivergingSymlog().constant((constant = +constant)),
    transformSymlog(constant),
    channels,
    options
  );
}

const transformIdentity = {
  apply(x) {
    return x;
  },
  invert(x) {
    return x;
  }
};

const transformLog = {
  apply: Math.log,
  invert: Math.exp
};

const transformSqrt = {
  apply(x) {
    return Math.sign(x) * Math.sqrt(Math.abs(x));
  },
  invert(x) {
    return Math.sign(x) * (x * x);
  }
};

function transformPow(exponent) {
  return exponent === 0.5
    ? transformSqrt
    : {
        apply(x) {
          return Math.sign(x) * Math.pow(Math.abs(x), exponent);
        },
        invert(x) {
          return Math.sign(x) * Math.pow(Math.abs(x), 1 / exponent);
        }
      };
}

function transformSymlog(constant) {
  return {
    apply(x) {
      return Math.sign(x) * Math.log1p(Math.abs(x / constant));
    },
    invert(x) {
      return Math.sign(x) * Math.expm1(Math.abs(x)) * constant;
    }
  };
}
