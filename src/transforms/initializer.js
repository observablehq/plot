// If both i1 and i2 are defined, returns a composite initializer that first
// applies i1 and then applies i2.
export function initializer({initializer: i1, ...options} = {}, i2) {
  return {
    ...options,
    initializer: composeInitializer(i1, i2)
  };
}

export function composeInitializer(i1, i2) {
  if (i1 == null) return i2 === null ? undefined : i2;
  if (i2 == null) return i1 === null ? undefined : i1;
  return function(data, facets, channels, scales, dimensions) {
    let c1, c2;
    ({data, facets, channels: c1} = i1.call(this, data, facets, channels, scales, dimensions));
    ({data, facets, channels: c2} = i2.call(this, data, facets, {...channels, ...c1}, scales, dimensions));
    return {data, facets, channels: {...c1, ...c2}};
  };
}
