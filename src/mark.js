export class Mark {
  constructor(data, channels) {
    this.data = data;
    this.channels = channels = Object.fromEntries(Array.from(
      Object.entries(channels).filter(([, channel]) => channel),
      ([name, channel]) => [name, Channel(data, channel)]
    ));

    // Enforce that all present channels have the same length.
    for (const key in channels) {
      const {value: {length}} = channels[key];
      for (const otherKey in channels) {
        if (key === otherKey) continue;
        const {value: {length: otherLength}} = channels[otherKey];
        if (otherLength !== length) throw new Error("inconsistent channel length");
      }
      break;
    }
  }
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

export const indexOf = (d, i) => i;
export const identity = d => d;
export const zero = () => 0;
