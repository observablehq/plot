export function boxX(data: any, { x, y, fill, fillOpacity, stroke, strokeOpacity, strokeWidth, ...options }?: {
    x?: {
        transform: (x: any) => any;
    };
    y?: any;
    fill?: string;
    fillOpacity: any;
    stroke?: string;
    strokeOpacity: any;
    strokeWidth?: number;
}): any[];
export function boxY(data: any, { y, x, fill, fillOpacity, stroke, strokeOpacity, strokeWidth, ...options }?: {
    y?: {
        transform: (y: any) => any;
    };
    x?: any;
    fill?: string;
    fillOpacity: any;
    stroke?: string;
    strokeOpacity: any;
    strokeWidth?: number;
}): any[];
