export function groupZ(outputs: any, options: any): {
    y: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
};
export function groupX(outputs?: {
    y: string;
}, options?: {}): {
    y: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
};
export function groupY(outputs?: {
    x: string;
}, options?: {}): {
    y: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
};
export function group(outputs?: {
    fill: string;
}, options?: {}): {
    y: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
} | {
    y1: any;
    y2: any;
    x1: any;
    x2: any;
    transform: any;
    sort: any;
    stroke: any;
    fill: any;
    z: any;
};
export function hasOutput(outputs: any, ...names: any[]): boolean;
export function maybeOutputs(outputs: any, inputs: any): ({
    name: any;
    output: ((v: any) => any) | {
        transform: () => any;
        label: any;
    };
    initialize(data: any): void;
    scope(scope: any, I: any): void;
    reduce(I: any, extent: any): void;
} | {
    name: string;
    initialize(): void;
    scope(): void;
    reduce(): void;
})[];
export function maybeOutput(name: any, reduce: any, inputs: any): {
    name: any;
    output: ((v: any) => any) | {
        transform: () => any;
        label: any;
    };
    initialize(data: any): void;
    scope(scope: any, I: any): void;
    reduce(I: any, extent: any): void;
};
export function maybeEvaluator(name: any, reduce: any, inputs: any): {
    label: any;
    initialize(data: any): void;
    scope(scope: any, I: any): void;
    reduce(I: any, extent: any): any;
};
export function maybeGroup(I: any, X: any): any;
export function maybeReduce(reduce: any, value: any): any;
export function maybeSubgroup(outputs: any, Z: any, F: any, S: any): any;
export function maybeSort(facets: any, sort: any, reverse: any): void;
export namespace reduceIdentity {
    function reduce(I: any, X: any): any[];
    function reduce(I: any, X: any): any[];
}
export namespace reduceFirst {
    function reduce(I: any, X: any): any;
    function reduce(I: any, X: any): any;
}
export namespace reduceCount {
    const label: string;
    function reduce(I: any): any;
    function reduce(I: any): any;
}
