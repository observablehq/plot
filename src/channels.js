import {group} from "d3-array";

// TODO Don’t mutate channels in-place?
export function Marks(data, marks = []) {
  for (const mark of marks) {
    mark.channels = Object.fromEntries(Array.from(
      Object.entries(mark.channels).filter(([, channel]) => channel),
      ([name, channel]) => [name, Channel(data, channel)]
    ));
  }
  return marks;
}

export function Channels(marks) {
  return group(
    marks.flatMap(m => Object.values(m.channels).filter(({scale}) => scale)),
    ({scale}) => scale
  );
}

function Channel(data, {scale = null, type, value, label}) {
  if (typeof value === "string") label = value, value = Array.from(data, Field(value));
  else if (typeof value === "function") value = Array.from(data, value);
  else if (typeof value.length !== "number") value = Array.from(value);
  return {scale, type, value, label};
}

function Field(value) {
  return d => d[value];
}
