export function memoize1(compute) {
  let cacheValue;
  let cacheKey = [];
  return (...keys) => {
    let cached = cacheKey.length === keys.length;
    if (cached) {
      for (let i = 0; i < cacheKey.length; ++i) {
        if (cacheKey[i] !== keys[i]) {
          cached = false;
          break;
        }
      }
    }
    if (!cached) {
      cacheKey = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
