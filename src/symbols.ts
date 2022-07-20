type SymbolString = "asterisk" | "circle" | "cross" | "diamond" | "diamond2" | "hexagon" | "plus" | "square" | "square2" | "star" | "times" | "triangle" | "triangle2" | "wye";
type SymbolObject = {draw: (context: CanvasPath, size: number) => void};
type MaybeSymbol = SymbolString | SymbolObject | null | undefined;

import {symbolAsterisk, symbolDiamond2, symbolPlus, symbolSquare2, symbolTriangle2, symbolX as symbolTimes} from "d3";
import {symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye} from "d3";

export const sqrt3 = Math.sqrt(3);
export const sqrt4_3 = 2 / sqrt3;

const symbolHexagon: SymbolObject = {
  draw(context, size) {
    const rx = Math.sqrt(size / Math.PI), ry = rx * sqrt4_3, hy = ry / 2;
    context.moveTo(0, ry);
    context.lineTo(rx, hy);
    context.lineTo(rx, -hy);
    context.lineTo(0, -ry);
    context.lineTo(-rx, -hy);
    context.lineTo(-rx, hy);
    context.closePath();
  }
};

const symbols = new Map([
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

function isSymbolObject(value: MaybeSymbol) {
  return value && typeof (value as SymbolObject).draw === "function";
}

export function isSymbol(value: MaybeSymbol) {
  if (isSymbolObject(value)) return true;
  if (typeof value !== "string") return false;
  return symbols.has(value.toLowerCase());
}

export function maybeSymbol(symbol: MaybeSymbol) {
  if (symbol == null || isSymbolObject(symbol)) return symbol;
  const value = symbols.get(`${symbol}`.toLowerCase());
  if (value) return value;
  throw new Error(`invalid symbol: ${symbol}`);
}

export function maybeSymbolChannel(symbol: MaybeSymbol) {
  if (symbol == null || isSymbolObject(symbol)) return [undefined, symbol];
  if (typeof symbol === "string") {
    const value = symbols.get(`${symbol}`.toLowerCase());
    if (value) return [undefined, value];
  }
  return [symbol, undefined];
}
