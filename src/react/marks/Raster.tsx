// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo, useRef, useEffect} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "raster"
};

export interface RasterProps {
  data?: any;
  fill?: any;
  fillOpacity?: any;
  x?: any;
  y?: any;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  pixelSize?: number;
  blur?: number;
  imageRendering?: string;
  interpolate?: string;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  [key: string]: any;
}

// Raster renders gridded data as an image element using canvas.
// This is an SSR-compatible version that renders a placeholder on the server
// and fills in canvas data on the client via useEffect.
export function Raster({
  data,
  fill,
  fillOpacity,
  x,
  y,
  width: gridWidth,
  height: gridHeight,
  x1: boundsX1,
  y1: boundsY1,
  x2: boundsX2,
  y2: boundsY2,
  pixelSize = 1,
  imageRendering = "auto",
  interpolate,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: RasterProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(x != null ? {x: {value: x, scale: "x", optional: true}} : {}),
      ...(y != null ? {y: {value: y, scale: "y", optional: true}} : {})
    }),
    [fill, x, y]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : undefined,
      dx,
      dy,
      className
    }),
    [fill, dx, dy, className, restOptions]
  );

  const {values, index, dimensions} = useMark({data, channels, ariaLabel: defaults.ariaLabel, tip, ...markOptions});

  const imageRef = useRef<SVGImageElement>(null);

  // Render image via canvas on the client
  useEffect(() => {
    if (!values || !index || !dimensions || !imageRef.current) return;
    if (typeof document === "undefined") return; // SSR guard

    const {width: plotWidth, height: plotHeight, marginLeft, marginTop, marginRight, marginBottom} = dimensions;
    const w = gridWidth ?? Math.ceil((plotWidth - marginLeft - marginRight) / pixelSize);
    const h = gridHeight ?? Math.ceil((plotHeight - marginTop - marginBottom) / pixelSize);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(w, h);
    const {data: pixels} = imageData;

    // Fill pixels from data
    const {fill: F, fillOpacity: FO} = values;
    const n = Math.min(index.length, w * h);
    for (let j = 0; j < n; j++) {
      const i = index[j];
      const color = F ? F[i] : "#000";
      const alpha = FO ? FO[i] : 1;
      // Parse color — simple hex handling
      const p = j * 4;
      if (typeof color === "string" && color.startsWith("#")) {
        const hex =
          color.length === 4 ? color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color.slice(1);
        pixels[p] = parseInt(hex.slice(0, 2), 16);
        pixels[p + 1] = parseInt(hex.slice(2, 4), 16);
        pixels[p + 2] = parseInt(hex.slice(4, 6), 16);
        pixels[p + 3] = Math.round(alpha * 255);
      } else {
        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
        pixels[p + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    imageRef.current.setAttribute("href", canvas.toDataURL());
  }, [values, index, dimensions, gridWidth, gridHeight, pixelSize]);

  if (!dimensions) return null;

  const {width: plotWidth, height: plotHeight, marginLeft, marginTop, marginRight, marginBottom} = dimensions;
  const x1 = boundsX1 ?? marginLeft;
  const y1 = boundsY1 ?? marginTop;
  const imgW = (boundsX2 ?? plotWidth - marginRight) - x1;
  const imgH = (boundsY2 ?? plotHeight - marginBottom) - y1;

  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      <image
        ref={imageRef}
        x={x1}
        y={y1}
        width={imgW}
        height={imgH}
        imageRendering={imageRendering}
        preserveAspectRatio="none"
      />
    </g>
  );
}
