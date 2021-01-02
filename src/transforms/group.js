import {rollups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, maybeValue, range, take} from "../mark.js";

export function group1(x) {
  const {value} = maybeValue({value: x});
  let values;
  return (data, index = range(data), allData = data) => {
    if (values === undefined) values = valueof(allData, value);
    return rollups(
      index,
      v => take(allData, v),
      i => values[i]
    ).filter(defined1);
  };
}

export function group2(vx, vy) {
  const {value: x} = maybeValue({value: vx});
  const {value: y} = maybeValue({value: vy});
  let valuesX, valuesY;
  return (data, index = range(data), allData = data) => {
    if (valuesX === undefined) valuesX = valueof(allData, x);
    if (valuesY === undefined) valuesY = valueof(allData, y);
    return rollups(index,
      v => take(allData, v),
      i => valuesX[i],
      i => valuesY[i]
    ).flatMap(([x, xgroup]) => xgroup.map(([y, ygroup]) => [x, y, ygroup]));
  };
}

// Since marks don’t render when channel values are undefined (or null or NaN),
// we apply the same logic when grouping. If you want to preserve the group for
// undefined data, map it to an “other” value first.
function defined1([key]) {
  return defined(key);
}
