// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "waffle"
};

export interface WaffleProps {
  data?: any;
  x?: any;
  x1?: any;
  x2?: any;
  y?: any;
  y1?: any;
  y2?: any;
  fill?: any;
  stroke?: any;
  fillOpacity?: any;
  strokeWidth?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  unit?: number;
  gap?: number;
  multiple?: number;
  round?: (v: number) => number;
  rx?: number;
  ry?: number;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

// WaffleY renders a vertical waffle chart (unit squares stacked along y).
// Each unit square represents one "unit" of the value.
export function WaffleY({
  data,
  x,
  y1,
  y2,
  fill,
  stroke,
  fillOpacity,
  strokeWidth,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unit = 1,
  gap = 1,
  multiple = 1,
  round = Math.round,
  rx,
  ry,
  className,
  onClick,
  ...restOptions
}: WaffleProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      y1: {value: y1, scale: "y"},
      y2: {value: y2, scale: "y"},
      x: {value: x, scale: "x", type: "band", optional: true},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y1, y2, fill, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : "currentColor",
      stroke: typeof stroke === "string" ? stroke : undefined,
      dx,
      dy,
      className
    }),
    [fill, stroke, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ariaLabel: "waffle", tip, ...markOptions});

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y1: Y1, y2: Y2} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;
  const xBandwidth = scales.x?.bandwidth ? scales.x.bandwidth() : width - marginLeft - marginRight;

  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const y1v = Y1 ? Y1[i] : height - marginBottom;
        const y2v = Y2 ? Y2[i] : marginTop;
        const xv = X ? X[i] : marginLeft;
        const h = Math.abs(y1v - y2v);
        const yMin = Math.min(y1v, y2v);
        const cellSize = Math.max(1, (xBandwidth - gap) / multiple);
        const count = round(h / cellSize);

        const cells: React.ReactNode[] = [];
        for (let c = 0; c < count; c++) {
          const col = c % multiple;
          const row = Math.floor(c / multiple);
          cells.push(
            <rect
              key={c}
              x={xv + col * (cellSize + gap)}
              y={yMin + h - (row + 1) * (cellSize + gap)}
              width={Math.max(0, cellSize)}
              height={Math.max(0, cellSize)}
              rx={rx}
              ry={ry}
            />
          );
        }

        return (
          <g
            key={i}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
          >
            {cells}
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </g>
        );
      })}
    </g>
  );
}

// WaffleX renders a horizontal waffle chart.
export function WaffleX({
  data,
  x1,
  x2,
  y,
  fill,
  stroke,
  fillOpacity,
  strokeWidth,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unit = 1,
  gap = 1,
  multiple = 1,
  round = Math.round,
  rx,
  ry,
  className,
  onClick,
  ...restOptions
}: WaffleProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x1: {value: x1, scale: "x"},
      x2: {value: x2, scale: "x"},
      y: {value: y, scale: "y", type: "band", optional: true},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x1, x2, y, fill, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : "currentColor",
      stroke: typeof stroke === "string" ? stroke : undefined,
      dx,
      dy,
      className
    }),
    [fill, stroke, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ariaLabel: "waffle", tip, ...markOptions});

  if (!values || !index || !dimensions || !scales) return null;

  const {x1: X1, x2: X2, y: Y} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;
  const yBandwidth = scales.y?.bandwidth ? scales.y.bandwidth() : height - marginTop - marginBottom;

  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const x1v = X1 ? X1[i] : marginLeft;
        const x2v = X2 ? X2[i] : width - marginRight;
        const yv = Y ? Y[i] : marginTop;
        const w = Math.abs(x2v - x1v);
        const xMin = Math.min(x1v, x2v);
        const cellSize = Math.max(1, (yBandwidth - gap) / multiple);
        const count = round(w / cellSize);

        const cells: React.ReactNode[] = [];
        for (let c = 0; c < count; c++) {
          const row = c % multiple;
          const col = Math.floor(c / multiple);
          cells.push(
            <rect
              key={c}
              x={xMin + col * (cellSize + gap)}
              y={yv + row * (cellSize + gap)}
              width={Math.max(0, cellSize)}
              height={Math.max(0, cellSize)}
              rx={rx}
              ry={ry}
            />
          );
        }

        return (
          <g
            key={i}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
          >
            {cells}
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </g>
        );
      })}
    </g>
  );
}
