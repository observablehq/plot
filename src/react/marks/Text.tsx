// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {
  indirectStyleProps,
  directStyleProps,
  channelStyleProps,
  computeTransform,
  computeFrameAnchor
} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "text",
  fill: "currentColor",
  stroke: null as any
};

export interface TextProps {
  data?: any;
  x?: any;
  y?: any;
  text?: any;
  fill?: any;
  stroke?: any;
  fillOpacity?: any;
  strokeOpacity?: any;
  strokeWidth?: any;
  opacity?: any;
  title?: any;
  href?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  rotate?: number;
  fontSize?: number | string;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string | number;
  fontVariant?: string;
  textAnchor?: string;
  lineAnchor?: string;
  frameAnchor?: string;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

export function Text({
  data,
  x,
  y,
  text,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  opacity,
  title,
  href,
  tip,
  dx = 0,
  dy = 0,
  rotate = 0,
  fontSize,
  fontFamily,
  fontStyle,
  fontWeight,
  fontVariant,
  textAnchor,
  lineAnchor = "middle",
  frameAnchor,
  className,
  onClick,
  ...restOptions
}: TextProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true},
      text: {value: text ?? (x == null && y == null ? (d: any) => d : undefined), optional: true, filter: null},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {}),
      ...(href != null ? {href: {value: href, optional: true, filter: null}} : {})
    }),
    [x, y, text, fill, opacity, title, href]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : defaults.fill,
      stroke: typeof stroke === "string" ? stroke : undefined,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : undefined,
      dx,
      dy,
      className,
      frameAnchor
    }),
    [fill, stroke, strokeWidth, dx, dy, className, frameAnchor, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y, text: T} = values;
  const [anchorX, anchorY] = computeFrameAnchor(frameAnchor, dimensions);

  const transform = computeTransform({dx, dy}, {x: X && scales.x, y: Y && scales.y});

  // Compute dominant-baseline from lineAnchor
  const dominantBaseline = lineAnchor === "top" ? "hanging" : lineAnchor === "bottom" ? "alphabetic" : "central";

  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {}),
    ...(fontSize != null ? {fontSize} : {}),
    ...(fontFamily != null ? {fontFamily} : {}),
    ...(fontStyle != null ? {fontStyle} : {}),
    ...(fontWeight != null ? {fontWeight} : {}),
    ...(fontVariant != null ? {fontVariant} : {}),
    ...(textAnchor != null ? {textAnchor} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const tx = X ? X[i] : anchorX;
        const ty = Y ? Y[i] : anchorY;
        const content = T ? `${T[i] ?? ""}` : "";
        if (!content) return null;

        const chStyles = channelStyleProps(i, values);
        const dStyles = directStyleProps(markOptions);

        return (
          <text
            key={i}
            x={tx}
            y={ty}
            dominantBaseline={dominantBaseline}
            {...(rotate ? {transform: `rotate(${rotate},${tx},${ty})`} : {})}
            {...dStyles}
            {...chStyles}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
          >
            {content}
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </text>
        );
      })}
    </g>
  );
}

export function TextX(props: TextProps) {
  const {x = (d: any) => d, ...rest} = props;
  return <Text x={x} {...rest} />;
}

export function TextY(props: TextProps) {
  const {y = (d: any) => d, ...rest} = props;
  return <Text y={y} {...rest} />;
}
