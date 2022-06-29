/* eslint-disable @typescript-eslint/no-explicit-any */
export function memoize1<T>(compute: (...rest: any[]) => T) {
  let cacheValue: T, cacheKeys: any[] | undefined;
  return (...keys: any[]) => {
    if (cacheKeys?.length !== keys.length || cacheKeys.some((k, i) => k !== keys[i])) {
      cacheKeys = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
