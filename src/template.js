export function template(strings, ...parts) {
  let n = parts.length;

  // If any of the interpolated parameters are strings rather than functions,
  // bake them into the template to optimize performance during render.
  for (let j = 0, copy = true; j < n; ++j) {
    if (typeof parts[j] !== "function") {
      if (copy) {
        strings = strings.slice(); // copy before mutate
        copy = false;
      }
      strings.splice(j, 2, strings[j] + parts[j] + strings[j + 1]);
      parts.splice(j, 1);
      --j, --n;
    }
  }

  return (i) => {
    let s = strings[0];
    for (let j = 0; j < n; ++j) {
      s += parts[j](i) + strings[j + 1];
    }
    return s;
  };
}
