import {field, identity, valueof} from "../mark.js";

// TODO allow partially-defined data
export function movingAverage(N, value = identity) {
  if (!((N = Math.floor(N)) > 0)) throw new Error("invalid N");
  if (typeof value === "string") value = field(value);
  else if (typeof value !== "function") throw new Error("invalid value");
  return {
    transform(data) {
      let i = 0;
      let sum = 0;
      const values = valueof(data, value, Float64Array);
      const means = new Float64Array(values.length);
      for (let n = Math.min(N - 1, values.length); i < n; ++i) {
        means[i] = NaN;
        sum += values[i];
      }
      for (let n = values.length; i < n; ++i) {
        sum += values[i];
        means[i] = sum / N;
        sum -= values[i - N + 1];
      }
      means.subarray(0, N >> 1).reverse();
      means.subarray(N >> 1).reverse();
      means.reverse();
      return means;
    }
  };
}
