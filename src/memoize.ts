export function memoize1<R extends Array<unknown>, T>(compute: (...rest: R) => T): (...rest: R) => T {
  let cacheValue: T;
  let cacheKeys: R | null = null;
  return (...keys: R) => {
    if (cacheKeys?.length !== keys.length || cacheKeys.some((k, i) => k !== keys[i])) {
      cacheKeys = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
