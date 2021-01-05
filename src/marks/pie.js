import {arc} from "./arc.js";
import {pie as transformPie} from "../transforms/pie.js";
import {field} from "../mark.js";

function noSort() {}

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
  if (value !== undefined) pie.value(typeof value === "string" ? field(value) : value);
  if (sort !== undefined) pie.sort(sort || noSort);
  if (sortValues !== undefined) pie.sortValues(sortValues || noSort);
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
