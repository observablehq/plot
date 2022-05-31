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
    let c1, d1, f1, c2, d2, f2;
    ({data: d1 = data, facets: f1 = facets, channels: c1} = i1.call(this, data, facets, channels, scales, dimensions));
    ({data: d2 = d1, facets: f2 = f1, channels: c2} = i2.call(this, d1, f1, {...channels, ...c1}, scales, dimensions));
    return {data: d2, facets: f2, channels: {...c1, ...c2}};
  };
}
