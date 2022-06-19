export function barX(data: any, options?: {
    y: (d: any, i: any) => any;
    x2: {
        transform: (d: any) => any;
    };
}): BarX;
export function barY(data: any, options?: {
    x: (d: any, i: any) => any;
    y2: {
        transform: (d: any) => any;
    };
}): BarY;
export class AbstractBar extends Mark<any, any[]> {
    constructor(data: any, channels: any, options: {}, defaults: any);
    insetTop: any;
    insetRight: any;
    insetBottom: any;
    insetLeft: any;
    rx: any;
    ry: any;
    render(index: any, scales: any, channels: any, dimensions: any): any;
    _x(scales: any, { x: X }: {
        x: any;
    }, { marginLeft }: {
        marginLeft: any;
    }): any;
    _y(scales: any, { y: Y }: {
        y: any;
    }, { marginTop }: {
        marginTop: any;
    }): any;
    _width({ x }: {
        x: any;
    }, { x: X }: {
        x: any;
    }, { marginRight, marginLeft, width }: {
        marginRight: any;
        marginLeft: any;
        width: any;
    }): number;
    _height({ y }: {
        y: any;
    }, { y: Y }: {
        y: any;
    }, { marginTop, marginBottom, height }: {
        marginTop: any;
        marginBottom: any;
        height: any;
    }): number;
}
export class BarX extends AbstractBar {
    constructor(data: any, options?: {});
    _transform(selection: any, { x }: {
        x: any;
    }, dx: any, dy: any): void;
    _x({ x }: {
        x: any;
    }, { x1: X1, x2: X2 }: {
        x1: any;
        x2: any;
    }, { marginLeft }: {
        marginLeft: any;
    }): any;
    _width({ x }: {
        x: any;
    }, { x1: X1, x2: X2 }: {
        x1: any;
        x2: any;
    }, { marginRight, marginLeft, width }: {
        marginRight: any;
        marginLeft: any;
        width: any;
    }): number | ((i: any) => number);
}
export class BarY extends AbstractBar {
    constructor(data: any, options?: {});
    _transform(selection: any, { y }: {
        y: any;
    }, dx: any, dy: any): void;
    _y({ y }: {
        y: any;
    }, { y1: Y1, y2: Y2 }: {
        y1: any;
        y2: any;
    }, { marginTop }: {
        marginTop: any;
    }): any;
    _height({ y }: {
        y: any;
    }, { y1: Y1, y2: Y2 }: {
        y1: any;
        y2: any;
    }, { marginTop, marginBottom, height }: {
        marginTop: any;
        marginBottom: any;
        height: any;
    }): number | ((i: any) => number);
}
import { Mark } from "../plot.js";
