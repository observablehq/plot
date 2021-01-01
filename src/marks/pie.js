import {arc} from "./arc.js";
import {pie as transformPie} from "../transforms/pie.js";

export function pie(data, {
  value,
  sort,
  sortValues,
  startAngle,
  endAngle,
  padAngle,
  ...options
} = {}) {
  const transform = transformPie();
  if (value !== undefined) transform.value(value);
  if (sort !== undefined) transform.sort(sort);
  if (sortValues !== undefined) transform.sortValues(sortValues);
  if (startAngle !== undefined) transform.startAngle(startAngle);
  if (endAngle !== undefined) transform.endAngle(endAngle);
  if (padAngle !== undefined) transform.padAngle(padAngle);
  
  return arc(
    data,
    {
      ...options,
      padAngle,
      transform
    }
  );
}
