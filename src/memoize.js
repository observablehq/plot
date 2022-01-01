export function memoize1(compute) {
  let cacheValue;
  let cacheKey = {};
  return (...keys) => {
    let i = 0, n = cacheKey.length;
    while (i < n && cacheKey[i] === keys[i]) ++i;
    if (i !== n || n !== keys.length) {
      cacheKey = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
