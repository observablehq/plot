// Unlike d3.group, this implicitly coerces to a primitive value if possible via
// valueOf; for example Date is coerced to a number. And, this returns an
// iterable of subsets of the given index rather than a map.
export function group(index, values) {
  const groups = new Map();
  for (const i of index) {
    const value = values[i];
    const key = value !== null && typeof value === "object" ? value.valueOf() : value;
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [i]);
    else group.push(i);
  }
  return groups.values();
}
