import type {MaybeSymbol, SymbolObject} from "./api.js";
import type {Datum} from "./data.js";

import {symbolAsterisk, symbolDiamond2, symbolPlus, symbolSquare2, symbolTriangle2, symbolX as symbolTimes} from "d3";
import {symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye} from "d3";

export const sqrt3 = Math.sqrt(3);
export const sqrt4_3 = 2 / sqrt3;

const symbolHexagon: SymbolObject = {
  draw(context, size) {
    const rx = Math.sqrt(size / Math.PI),
      ry = rx * sqrt4_3,
      hy = ry / 2;
    context.moveTo(0, ry);
    context.lineTo(rx, hy);
    context.lineTo(rx, -hy);
    context.lineTo(0, -ry);
    context.lineTo(-rx, -hy);
    context.lineTo(-rx, hy);
    context.closePath();
  }
};

const symbols = new Map<string, SymbolObject>([
  ["asterisk", symbolAsterisk],
  ["circle", symbolCircle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["diamond2", symbolDiamond2],
  ["hexagon", symbolHexagon],
  ["plus", symbolPlus],
  ["square", symbolSquare],
  ["square2", symbolSquare2],
  ["star", symbolStar],
  ["times", symbolTimes],
  ["triangle", symbolTriangle],
  ["triangle2", symbolTriangle2],
  ["wye", symbolWye]
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSymbolObject(value: any) {
  return value && typeof (value as SymbolObject).draw === "function";
}

export function isSymbol<T extends Datum>(value: MaybeSymbol<T>) {
  if (isSymbolObject(value)) return true;
  if (typeof value !== "string") return false;
  return symbols.has(value.toLowerCase());
}

export function maybeSymbol<T extends Datum>(symbol: MaybeSymbol<T>) {
  if (symbol == null || isSymbolObject(symbol)) return symbol;
  const value = symbols.get(`${symbol}`.toLowerCase());
  if (value) return value;
  throw new Error(`invalid symbol: ${symbol}`);
}

export function maybeSymbolChannel<T extends Datum>(symbol: MaybeSymbol<T>) {
  if (symbol == null || isSymbolObject(symbol)) return [undefined, symbol];
  if (typeof symbol === "string") {
    const value = symbols.get(`${symbol}`.toLowerCase());
    if (value) return [undefined, value];
  }
  return [symbol, undefined];
}
