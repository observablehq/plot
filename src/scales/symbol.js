import {symbolAsterisk, symbolDiamond2, symbolPlus, symbolSquare2, symbolTriangle2, symbolX as symbolTimes} from "d3";
import {symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye} from "d3";

const symbols = new Map([
  ["asterisk", symbolAsterisk],
  ["circle", symbolCircle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["diamond2", symbolDiamond2],
  ["plus", symbolPlus],
  ["square", symbolSquare],
  ["square2", symbolSquare2],
  ["star", symbolStar],
  ["times", symbolTimes],
  ["triangle", symbolTriangle],
  ["triangle2", symbolTriangle2],
  ["wye", symbolWye]
]);

function isSymbol(symbol) {
  return symbol && typeof symbol.draw === "function";
}

export function maybeSymbol(symbol) {
  if (symbol == null || isSymbol(symbol)) return symbol;
  const value = symbols.get(`${symbol}`.toLowerCase());
  if (value) return value;
  throw new Error(`invalid symbol: ${symbol}`);
}

export function maybeSymbolChannel(symbol) {
  if (symbol == null || isSymbol(symbol)) return [undefined, symbol];
  if (typeof symbol === "string") {
    const value = symbols.get(`${symbol}`.toLowerCase());
    if (value) return [undefined, value];
  }
  return [symbol, undefined];
}
