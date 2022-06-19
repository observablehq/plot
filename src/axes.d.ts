export function Axes({ x: xScale, y: yScale, fx: fxScale, fy: fyScale }: {
    x: any;
    y: any;
    fx: any;
    fy: any;
}, { x, y, fx, fy, axis, grid, line, label, facet: { axis: facetAxis, grid: facetGrid, label: facetLabel } }?: {
    x?: {};
    y?: {};
    fx?: {};
    fy?: {};
    axis?: boolean;
    grid: any;
    line: any;
    label: any;
    facet?: {
        axis?: any;
        grid: any;
        label?: any;
    };
}): {
    fy: AxisY;
    fx: AxisX;
    y: AxisY;
    x: AxisX;
};
export function autoAxisTicks({ x, y, fx, fy }: {
    x: any;
    y: any;
    fx: any;
    fy: any;
}, { x: xAxis, y: yAxis, fx: fxAxis, fy: fyAxis }: {
    x: any;
    y: any;
    fx: any;
    fy: any;
}): void;
export function autoScaleLabels(channels: any, scales: any, { x, y, fx, fy }: {
    x: any;
    y: any;
    fx: any;
    fy: any;
}, dimensions: any, options: any): void;
export function inferFontVariant(scale: any): string;
import { AxisY } from "./axis.js";
import { AxisX } from "./axis.js";
