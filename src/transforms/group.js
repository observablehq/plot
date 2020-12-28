import {rollups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, maybeValue, indexOf} from "../mark.js";

export function group1(x) {
  let {value} = maybeValue({value: x});
  let values;
  return (data, index, allData = data) => {
    if (values === undefined) values = valueof(allData, value);
    if (!index) index = data.map(indexOf);
    return rollups(index,
      v => Array.from(v, i => allData[i]),
      i => values[i]
    ).filter(defined1);
  };
}

export function group2(vx, vy) {
  let {value: x} = maybeValue({value: vx});
  let {value: y} = maybeValue({value: vy});
  let valuesX, valuesY;
  return (data, index, allData = data) => {
    if (valuesX === undefined) valuesX = valueof(allData, x);
    if (valuesY === undefined) valuesY = valueof(allData, y);
    if (!index) index = data.map(indexOf);
    return rollups(index,
      v => v.map(i => allData[i]),
      i => valuesX[i],
      i => valuesY[i]
    )
    .flatMap(([x, xgroup]) => xgroup.map(([y, ygroup]) => [x, y, ygroup]));
  };
}

// Since marks don’t render when channel values are undefined (or null or NaN),
// we apply the same logic when grouping. If you want to preserve the group for
// undefined data, map it to an “other” value first.
function defined1([key]) {
  return defined(key);
}
