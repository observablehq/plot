export function layout({layout: layout1, ...options}, layout2) {
  if (layout2 == null) throw new Error("invalid layout");
  if (layout1 != null) layout2 = composeLayout(layout1, layout2);
  return {...options, layout: layout2};
}

// TODO Fix this. Or maybe not support layout composition? Because wouldn’t that
// imply recomputing the scales after each layout runs, sequentially? Or should
// layouts only have access to the values (and scales) as they were prior to any
// of the other layouts running?
function composeLayout(layout1, layout2) {
  return function(index, scales, values, dimensions) {
    const l1 = layout1.call(this, index, scales, values, dimensions);
    if (l1.index !== undefined) index = l1.index;
    if (l1.values !== undefined) values = {...values, ...l1.values};
    const l2 = layout2.call(this, index, scales, values, dimensions);
    return {
      index: l2.index === undefined ? l1.index : l2.index,
      values: l2.values === undefined ? l1.values : l1.values === undefined ? l2.values : {...l1.values, ...l2.values},
      channels: l2.channels === undefined ? l1.channels === undefined ? l2.channels : l1.channels : [...l1.channels, ...l2.channels]
    };
  };
}
