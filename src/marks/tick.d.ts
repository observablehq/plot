export function tickX(data: any, { x, ...options }?: {
    x?: {
        transform: (d: any) => any;
    };
}): TickX;
export function tickY(data: any, { y, ...options }?: {
    y?: {
        transform: (d: any) => any;
    };
}): TickY;
export class TickX extends AbstractTick {
    constructor(data: any, options?: {});
    insetTop: any;
    insetBottom: any;
    _transform(selection: any, { x }: {
        x: any;
    }, dx: any, dy: any): void;
    _x1(scales: any, { x: X }: {
        x: any;
    }): (i: any) => any;
    _x2(scales: any, { x: X }: {
        x: any;
    }): (i: any) => any;
    _y1(scales: any, { y: Y }: {
        y: any;
    }, { marginTop }: {
        marginTop: any;
    }): any;
    _y2({ y }: {
        y: any;
    }, { y: Y }: {
        y: any;
    }, { height, marginBottom }: {
        height: any;
        marginBottom: any;
    }): number | ((i: any) => number);
}
export class TickY extends AbstractTick {
    constructor(data: any, options?: {});
    insetRight: any;
    insetLeft: any;
    _transform(selection: any, { y }: {
        y: any;
    }, dx: any, dy: any): void;
    _x1(scales: any, { x: X }: {
        x: any;
    }, { marginLeft }: {
        marginLeft: any;
    }): any;
    _x2({ x }: {
        x: any;
    }, { x: X }: {
        x: any;
    }, { width, marginRight }: {
        width: any;
        marginRight: any;
    }): number | ((i: any) => number);
    _y1(scales: any, { y: Y }: {
        y: any;
    }): (i: any) => any;
    _y2(scales: any, { y: Y }: {
        y: any;
    }): (i: any) => any;
}
declare class AbstractTick extends Mark<any, any[]> {
    constructor(data: any, channels: any, options: any);
    render(index: any, scales: any, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
export {};
