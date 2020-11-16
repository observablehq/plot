import {group} from "d3-array";

export function Channels(marks) {
  return group(
    marks.flatMap(m => Object.values(m.channels).filter(({scale}) => scale)),
    ({scale}) => scale
  );
}

export function Channel(data, {scale = null, type, value, label}) {
  if (typeof value === "string") label = value, value = Array.from(data, Field(value));
  else if (typeof value === "function") value = Array.from(data, value);
  else if (typeof value.length !== "number") value = Array.from(value);
  return {scale, type, value, label};
}

function Field(value) {
  return d => d[value];
}

export const indexOf = (d, i) => i;
export const identity = d => d;
export const zero = () => 0;
