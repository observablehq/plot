export function treeNode({ path, delimiter, frameAnchor, treeLayout, treeSort, treeSeparation, treeAnchor, ...options }?: {
    path?: {
        transform: (d: any) => any;
    };
    delimiter: any;
    frameAnchor: any;
    treeLayout?: any;
    treeSort: any;
    treeSeparation: any;
    treeAnchor: any;
}): any;
export function treeLink({ path, delimiter, curve, stroke, strokeWidth, strokeOpacity, treeLayout, treeSort, treeSeparation, treeAnchor, ...options }?: {
    path?: {
        transform: (d: any) => any;
    };
    delimiter: any;
    curve?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    treeLayout?: any;
    treeSort: any;
    treeSeparation: any;
    treeAnchor: any;
}): any;
export function maybeTreeAnchor(anchor?: string): {
    frameAnchor: string;
    dx: number;
    position({ x, y }: {
        x: any;
        y: any;
    }, i: any, X: any, Y: any): void;
};
