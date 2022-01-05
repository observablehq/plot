import {symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye} from "d3";

const symbols = new Map([
  ["circle", symbolCircle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["square", symbolSquare],
  ["star", symbolStar],
  ["triangle", symbolTriangle],
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
