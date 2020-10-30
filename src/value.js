export function field({value, invert, ...options}, key) {
  return {
    value: d => d[value],
    label: !key ? value : `${
      key === "y" ? (invert ? "↓ " : "↑ "): ""}${
      value}${
      key === "x" ? (invert ? " ←" : " →"): ""}`,
    invert,
    ...options
  };
}

export function isMissing(value) {
  return !value || value.value === undefined;
}

export function isField(value) {
  return value && typeof value.value === "string";
}

export function isValue(value) {
  return value && (["string", "function"].includes(typeof value) || isIterable(value));
}

export function isIterable(value) {
  return value && ("length" in value || typeof value[Symbol.iterator] === "function");
}
