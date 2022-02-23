export function layout({layout: layout1, ...options}, layout2) {
  if (layout2 == null) throw new Error("invalid layout");
  layout2 = partialLayout(layout2);
  if (layout1 != null) layout2 = composeLayout(layout1, layout2);
  return {...options, layout: layout2};
}

function composeLayout(l1, l2) {
  return function(index, scales, values, dimensions) {
    values = l1.call(this, index, scales, values, dimensions);
    return l2.call(this, index, scales, values, dimensions);
  };
}

function partialLayout(l) {
  return function(index, scales, values, dimensions) {
    return {...values, ...l.call(this, index, scales, values, dimensions)};
  };
}
