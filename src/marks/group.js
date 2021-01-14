import {arrayify, identity, first, second, maybeLabel, maybeZero} from "../mark.js";
import {group1, group2} from "../transforms/group.js";
import {barX, barY} from "./bar.js";
import {cell} from "./cell.js";

export function group(data, {
  x = first,
  y = second,
  transform,
  ...options
} = {}) {
  if (transform) data = transform(arrayify(data));
  return cell(
    data,
    {
      ...options,
      transform: group2(x, y),
      x: maybeLabel(first, x),
      y: maybeLabel(second, y),
      fill: length3
    }
  );
}

export function groupX(data, {
  x = identity,
  y,
  y1,
  y2,
  transform,
  ...options
} = {}) {
  data = arrayify(data);
  if (transform) data = transform(data);
  ([y1, y2] = maybeZero(y, y1, y2, maybeLength(data, options)));
  return barY(
    data,
    {
      ...options,
      transform: group1(x),
      x: maybeLabel(first, x),
      y1,
      y2
    }
  );
}

export function groupY(data, {
  y = identity,
  x,
  x1,
  x2,
  transform,
  ...options
} = {}) {
  data = arrayify(data);
  if (transform) data = transform(data);
  ([x1, x2] = maybeZero(x, x1, x2, maybeLength(data, options)));
  return barX(
    data,
    {
      ...options,
      transform: group1(y),
      x1,
      x2,
      y: maybeLabel(first, y)
    }
  );
}

function length2([, group]) {
  return group.length;
}

function length3([,, group]) {
  return group.length;
}

length2.label = length3.label = "Frequency";

function maybeLength(data, {normalize}) {
  return normalize ? normalizer(normalize, data.length) : length2;
}

// An alternative channel definition to length2 (above) that computes the
// proportion of each bin in [0, k]. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function normalizer(k, n) {
  k = k === true ? 100 : +k;
  const value = ([, group]) => group.length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
