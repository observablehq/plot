// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {contourDensity, geoPath} from "d3";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "density",
  fill: "none" as any,
  stroke: "currentColor",
  strokeWidth: 1,
  strokeMiterlimit: 1
};

export interface DensityProps {
  data?: any;
  x?: any;
  y?: any;
  weight?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  fillOpacity?: any;
  opacity?: any;
  bandwidth?: number;
  thresholds?: number | number[];
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  [key: string]: any;
}

export function Density({
  data,
  x,
  y,
  weight,
  fill,
  stroke,
  strokeWidth,
  strokeOpacity,
  fillOpacity,
  opacity,
  bandwidth = 20,
  thresholds = 20,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DensityProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(weight != null ? {weight: {value: weight, optional: true}} : {}),
      ...(typeof fill === "string" &&
      fill !== "none" &&
      fill !== "currentColor" &&
      !/^#|^rgb|^hsl/.test(fill) &&
      fill !== "density"
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof stroke === "string" &&
      stroke !== "none" &&
      stroke !== "currentColor" &&
      !/^#|^rgb|^hsl/.test(stroke) &&
      stroke !== "density"
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {})
    }),
    [x, y, weight, fill, stroke, opacity]
  );

  const useDensityFill = fill === "density";
  const useDensityStroke = stroke === "density";

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill: useDensityFill
        ? "currentColor"
        : typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
        ? fill
        : defaults.fill,
      stroke: useDensityStroke
        ? "none"
        : typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
        ? stroke
        : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, useDensityFill, useDensityStroke, restOptions]
  );

  const {values, index, dimensions} = useMark({data, channels, ariaLabel: defaults.ariaLabel, tip, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y, weight: W} = values;
  const {width, height} = dimensions;

  // Compute density contours
  const contours = useMemo(() => {
    if (!X || !Y || !index.length) return [];
    const density = contourDensity()
      .x((i: number) => X[i])
      .y((i: number) => Y[i])
      .size([width, height])
      .bandwidth(bandwidth);

    if (W) density.weight((i: number) => W[i]);
    if (typeof thresholds === "number") density.thresholds(thresholds);
    else if (Array.isArray(thresholds)) density.thresholds(thresholds);

    return density(index);
  }, [X, Y, W, index, width, height, bandwidth, thresholds]);

  const path = geoPath();
  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      {contours.map((contour: any, j: number) => {
        const d = path(contour);
        if (!d) return null;
        const densityValue = contour.value;
        const maxDensity = contours.length > 0 ? contours[contours.length - 1].value : 1;
        return (
          <path
            key={j}
            d={d}
            {...directStyleProps(markOptions)}
            {...(useDensityFill ? {fillOpacity: fillOpacity ?? densityValue / maxDensity} : {})}
            {...(useDensityStroke ? {stroke: markOptions.stroke, strokeOpacity: densityValue / maxDensity} : {})}
          />
        );
      })}
    </g>
  );
}
