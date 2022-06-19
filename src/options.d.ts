export function valueof(data: any, value: any, arrayType: any): any;
export function percentile(reduce: any): (I: any, f: any) => any;
export function maybeColorChannel(value: any, defaultValue: any): any[];
export function maybeNumberChannel(value: any, defaultValue: any): any[];
export function maybeKeyword(input: any, name: any, allowed: any): string;
export function keyword(input: any, name: any, allowed: any): string;
export function arrayify(data: any, type: any): any;
export function map(values: any, f: any, type?: ArrayConstructor): any[];
export function isTypedArray(values: any): boolean;
export function isObject(option: any): boolean;
export function isScaleOptions(option: any): boolean;
export function isOptions(option: any): boolean;
export function maybeZero(x: any, x1: any, x2: any, x3?: {
    transform: (d: any) => any;
}): any[];
export function maybeTuple(x: any, y: any): any[];
export function maybeZ({ z, fill, stroke }?: {
    z: any;
    fill: any;
    stroke: any;
}): any;
export function range(data: any): Uint32Array;
export function where(data: any, test: any): Uint32Array;
export function take(values: any, index: any): any[];
export function keyof(value: any): any;
export function maybeInput(key: any, options: any): any;
export function column(source: any): (((v: any) => any) | {
    transform: () => any;
    label: any;
})[];
export function maybeColumn(source: any): any[];
export function labelof(value: any, defaultValue: any): any;
export function mid(x1: any, x2: any): {
    transform(data: any): Float64Array | Date[];
    label: any;
};
export function maybeValue(value: any): any;
export function numberChannel(source: any): {
    transform: (data: any) => any;
    label: any;
};
export function isTextual(values: any): boolean;
export function isOrdinal(values: any): boolean;
export function isTemporal(values: any): boolean;
export function isTemporalString(values: any): any;
export function isNumericString(values: any): boolean;
export function isNumeric(values: any): boolean;
export function isFirst(values: any, is: any): any;
export function isEvery(values: any, is: any): boolean;
export function isColor(value: any): any;
export function isNoneish(value: any): boolean;
export function isNone(value: any): boolean;
export function isRound(value: any): boolean;
export function isSymbol(value: any): boolean;
export function maybeSymbol(symbol: any): any;
export function maybeSymbolChannel(symbol: any): any[];
export function maybeFrameAnchor(value?: string): string;
export function order(values: any): any;
export function field(name: any): (d: any) => any;
export function indexOf(d: any, i: any): any;
export namespace identity {
    function transform(d: any): any;
}
export function zero(): number;
export function one(): number;
export function string(x: any): any;
export function number(x: any): any;
export function boolean(x: any): any;
export function first(x: any): any;
export function second(x: any): any;
export function constant(x: any): () => any;
