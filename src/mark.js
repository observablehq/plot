export class Mark {
  constructor(data, channels = []) {
    this.data = data;
    this.scaleChannels = [];
    this.channels = Object.fromEntries(channels
      .filter(channel => {
        const {name, value, optional} = channel;
        if (value === undefined) {
          if (optional) return false;
          throw new Error(`missing channel value: ${name}`);
        }
        return true;
      })
      .map(channel => {
        const {name} = channel;
        channel = Channel(data, channel);
        if (channel.scale) this.scaleChannels.push(channel);
        return [name, channel];
      })
      .filter(([name]) => name));
  }
}

function Channel(data, {scale, type, value, label}) {
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
