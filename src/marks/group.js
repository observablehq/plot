import {identity, first, second, size, maybeLabel} from "../mark.js";
import {group1, group2} from "../transforms/group.js";
import {barX, barY} from "./bar.js";
import {cell} from "./cell.js";

export function group(data, {
  x = first,
  y = second,
  ...options
} = {}) {
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
  normalize,
  ...options
} = {}) {
  return barY(
    data,
    {
      ...options,
      transform: group1(x),
      x: maybeLabel(first, x),
      y: normalize ? normalizer(normalize, size(data)) : length2
    }
  );
}

export function groupY(data, {
  y = identity,
  normalize,
  ...options
} = {}) {
  return barX(
    data,
    {
      ...options,
      transform: group1(y),
      x: normalize ? normalizer(normalize, size(data)) : length2,
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

// An alternative channel definition to length2 (above) that computes the
// proportion of each bin in [0, k]. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function normalizer(k, n) {
  k = k === true ? 100 : +k;
  const value = ([, group]) => group.length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
