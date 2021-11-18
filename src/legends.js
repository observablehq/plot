import {exposeScale, Scale} from "./scales.js";
import {legendColor} from "./legends/color.js";

export function legend({color, ...options}) {
  if (color != null) {
    return legendColor(exposeScale(Scale("color", undefined, color)), {
//    ...color,
    legend: color.legend,
    label: color.label,
    tickSize: color.tickSize,
    width: color.width, 
    height: color.height,
    marginTop: color.marginTop,
    marginRight: color.marginRight,
    marginBottom: color.marginBottom,
    marginLeft: color.marginLeft,
    ticks: color.ticks,
    tickFormat: color.tickFormat,
    tickValues: color.tickValues,
    format: color.format,
    className: color.className,
    swatchSize: color.swatchSize,
    swatchWidth: color.swatchWidth,
    swatchHeight: color.swatchHeight,
    columns: color.columns,
    ...options
  });
  }
  throw new Error(`unsupported legend type`);
}
