import {interpolateHcl, interpolateHsl, interpolateNumber, interpolateRgb, interpolateRound, InternMap} from "d3";
import {isObject} from "./options.js";

export function maybeTimeFilter(filter = "eq") {
  if (typeof filter === "function") return timeFunction(filter);
  switch (`${filter}`.toLowerCase()) {
    case "lt": return timeLt;
    case "lte": return timeLte;
    case "gt": return timeGt;
    case "gte": return timeGte;
    case "eq": return timeEq;
  }
  throw new Error(`invalid time filter: ${filter}`);
}

function timeFunction(f) {
  return (I, T, time) => {
    return I.filter(i => f(T[i], time));
  };
}

function timeLt(I, T, time) {
  return I.filter(i => T[i] < time);
}

function timeLte(I, T, time) {
  return I.filter(i => T[i] <= time);
}

function timeGt(I, T, time) {
  return I.filter(i => T[i] > time);
}

function timeGte(I, T, time) {
  return I.filter(i => T[i] >= time);
}

function timeEq(I, T, time) {
  return I.filter(i => T[i] === time);
}

export function defaultKeys(times){
  const tkey = new InternMap();
  return times.map((t) => (tkey.set(t, tkey.has(t) ? 1 + tkey.get(t) : 0), tkey.get(t)));
}

export function maybeTween(tween, k) {
  const t = isObject(tween) ? tween[k] : tween;
  if (t == null) return;
  switch(t) {
    case "interpolateRound":
    case "round":
      return interpolateRound;
    case "number":
        return interpolateNumber;
    case "rgb":
      return interpolateRgb;
    case "hsl":
      return interpolateHsl;
    case "hcl":
      return interpolateHcl;
  }
  if (typeof t !== "function") throw new Error(`invalid tween: ${t}`);
  return t;
}
