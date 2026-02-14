// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {usePlotContext} from "../PlotContext.js";

export interface HexgridProps {
  binWidth?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  fill?: string;
  className?: string;
}

// Hexgrid renders a static hexagonal reference grid, typically used with the hexbin transform.
export function Hexgrid({
  binWidth = 20,
  stroke = "currentColor",
  strokeWidth = 1,
  strokeOpacity = 0.1,
  fill = "none",
  className
}: HexgridProps) {
  const {dimensions} = usePlotContext();
  if (!dimensions) return null;

  const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;

  const hexPath = useMemo(() => {
    const ox = marginLeft;
    const oy = marginTop;
    const w = width - marginLeft - marginRight;
    const h = height - marginTop - marginBottom;
    const rx = binWidth / 2;
    const ry = rx * Math.sqrt(4 / 3);
    const hy = ry / 2;
    const cols = Math.ceil(w / binWidth) + 1;
    const rows = Math.ceil(h / ry) + 1;

    const parts: string[] = [];
    for (let j = 0; j < rows; j++) {
      const cy = oy + j * ry;
      const xoff = j & 1 ? rx : 0;
      for (let i = 0; i < cols; i++) {
        const cx = ox + i * binWidth + xoff;
        // Hexagon: 6 vertices
        parts.push(
          `M${cx},${cy - ry / 2}` +
            `l${rx},${hy}` +
            `v${(ry / 2) * 2 - hy * 2 > 0 ? 0 : hy}` +
            `l${-rx},${hy}` +
            `l${-rx},${-hy}` +
            `v${-((ry / 2) * 2 - hy * 2 > 0 ? 0 : hy)}Z`
        );
      }
    }
    return parts.join("");
  }, [binWidth, width, height, marginTop, marginRight, marginBottom, marginLeft]);

  return (
    <path
      d={hexPath}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      className={className}
      aria-label="hexgrid"
    />
  );
}
