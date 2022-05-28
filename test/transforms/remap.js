import {initializer} from "@observablehq/plot";

export function remap(outputs = {}, options) {
  return initializer(options, (data, facets, channels, scales) => {
    return {
      data,
      facets,
      channels: Object.fromEntries(Object.entries(outputs).map(([name, map]) => {
        const channel = channels[name];
        if (!channel) throw new Error(`missing channel: ${name}`);
        const V = Array.from(channel.value);
        const n = V.length;
        if (channel.scale !== undefined) {
          const scale = scales[channel.scale];
          for (let i = 0; i < n; ++i) V[i] = scale(V[i]);
        }
        for (let i = 0; i < n; ++i) V[i] = map(V[i], i, V);
        return [name, {value: V}];
      }))
    };
  });
}
