export class Mark {
  constructor(data, channels) {
    this.data = data;
    this.channels = Object.fromEntries(Array.from(
      Object.entries(channels).filter(([, channel]) => channel),
      ([name, channel]) => [name, Channel(data, channel)]
    ));
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
