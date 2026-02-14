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
  ariaLabel: "image",
  fill: null as any,
  stroke: null as any
};

export interface ImageProps {
  data?: any;
  x?: any;
  y?: any;
  src?: any;
  width?: any;
  height?: any;
  r?: number;
  fill?: any;
  stroke?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  preserveAspectRatio?: string;
  crossOrigin?: string;
  frameAnchor?: string;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

export function Image({
  data,
  x,
  y,
  src,
  width: widthProp = 16,
  height: heightProp = 16,
  r,
  fill,
  stroke,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  preserveAspectRatio = "xMidYMid",
  crossOrigin,
  frameAnchor,
  className,
  onClick,
  ...restOptions
}: ImageProps) {
  const isSrcChannel =
    src != null &&
    ((typeof src === "string" && !src.startsWith("http") && !src.startsWith("/") && !src.startsWith("data:")) ||
      typeof src === "function" ||
      Array.isArray(src));
  const isWidthChannel = typeof widthProp === "string" || typeof widthProp === "function" || Array.isArray(widthProp);
  const isHeightChannel =
    typeof heightProp === "string" || typeof heightProp === "function" || Array.isArray(heightProp);

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true},
      ...(isSrcChannel ? {src: {value: src, optional: true}} : {}),
      ...(isWidthChannel ? {width: {value: widthProp, optional: true}} : {}),
      ...(isHeightChannel ? {height: {value: heightProp, optional: true}} : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y, src, widthProp, heightProp, opacity, title, isSrcChannel, isWidthChannel, isHeightChannel]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      dx,
      dy,
      className,
      frameAnchor
    }),
    [dx, dy, className, frameAnchor, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y, src: SRC, width: W, height: H} = values;
  const [anchorX, anchorY] = computeFrameAnchor(frameAnchor, dimensions);
  const constantSrc = isSrcChannel ? undefined : src;
  const constantWidth = isWidthChannel ? undefined : typeof widthProp === "number" ? widthProp : 16;
  const constantHeight = isHeightChannel ? undefined : typeof heightProp === "number" ? heightProp : 16;

  const transform = computeTransform({dx, dy}, scales);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const cx = X ? X[i] : anchorX;
        const cy = Y ? Y[i] : anchorY;
        const imgSrc = SRC ? SRC[i] : constantSrc;
        const w = W ? W[i] : constantWidth;
        const h = H ? H[i] : constantHeight;
        if (!imgSrc) return null;

        const clipId = r != null ? `clip-${i}` : undefined;

        return (
          <g key={i}>
            {r != null && (
              <clipPath id={clipId}>
                <circle cx={cx} cy={cy} r={r} />
              </clipPath>
            )}
            <image
              href={imgSrc}
              x={cx - w / 2}
              y={cy - h / 2}
              width={w}
              height={h}
              preserveAspectRatio={preserveAspectRatio}
              clipPath={clipId ? `url(#${clipId})` : undefined}
              crossOrigin={crossOrigin}
              {...directStyleProps(markOptions)}
              {...channelStyleProps(i, values)}
              onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
            >
              {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
            </image>
          </g>
        );
      })}
    </g>
  );
}
