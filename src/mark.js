export class Mark {
  constructor(data, channels = []) {
    const names = new Set();
    this.data = data;
    this.channels = channels.filter(channel => {
      const {name, value, optional} = channel;
      if (value === undefined) {
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      }
      if (name !== undefined) {
        const key = name + "";
        if (key === "__proto__") throw new Error("illegal channel name");
        if (names.has(key)) throw new Error(`duplicate channel: ${key}`);
        names.add(key);
      }
      return true;
    });
  }
  initialize(data) {
    return {
      index: data === undefined ? undefined : Array.from(data, indexOf),
      channels: this.channels.map(channel => {
        const {name} = channel;
        return [name == null ? undefined : name + "", Channel(data, channel)];
      })
    };
  }
}

// TODO Type coercion?
function Channel(data, {scale, type, value, label}) {
  if (typeof value === "string") label = value, value = Array.from(data, field(value));
  else if (typeof value === "function") value = Array.from(data, value);
  else if (typeof value.length !== "number") value = Array.from(value);
  return {scale, type, value, label};
}

export const field = value => d => d[value];
export const indexOf = (d, i) => i;
export const identity = d => d;
export const zero = () => 0;
export const string = x => x == null ? null : x + "";
export const number = x => x == null ? null : +x;
