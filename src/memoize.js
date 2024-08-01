export const unset = Symbol("unset");

export function memoize1(compute) {
  return (compute.length === 1 ? memoize1Arg : memoize1Args)(compute);
}

function memoize1Arg(compute) {
  let cacheValue;
  let cacheKey = unset;
  return (key) => {
    if (!Object.is(cacheKey, key)) {
      cacheKey = key;
      cacheValue = compute(key);
    }
    return cacheValue;
  };
}

function memoize1Args(compute) {
  let cacheValue, cacheKeys;
  return (...keys) => {
    if (cacheKeys?.length !== keys.length || cacheKeys.some((k, i) => !Object.is(k, keys[i]))) {
      cacheKeys = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
