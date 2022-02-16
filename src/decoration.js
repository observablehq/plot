import {defined} from "./defined.js";

export class Decoration {
  filter(index, channels, values) {
    for (const [name, {filter = defined}] of channels) {
      if (name !== undefined && filter !== null) {
        const value = values[name];
        index = index.filter(i => filter(value[i]));
      }
    }
    return index;
  }
}
