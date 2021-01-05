import {arc} from "./arc.js";
import {pie as transformPie} from "../transforms/pie.js";

export function pie(data, {
  value,
  sort,
  sortValues,
  startAngle,
  transform,
  endAngle,
  padAngle,
  ...options
} = {}) {
  const pie = transformPie();
  if (value !== undefined) pie.value(value);
  if (sort !== undefined) pie.sort(sort);
  if (sortValues !== undefined) pie.sortValues(sortValues);
  if (startAngle !== undefined) pie.startAngle(startAngle);
  if (endAngle !== undefined) pie.endAngle(endAngle);
  if (padAngle !== undefined) pie.padAngle(padAngle);
  
  return arc(
    data,
    {
      ...options,
      padAngle,
      transform: (!transform ? pie : data => pie(transform(data)))
    }
  );
}
