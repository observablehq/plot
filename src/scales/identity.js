import {scaleIdentity} from "d3-scale";
import {ScaleO} from "./ordinal.js";
import {ScaleQ} from "./quantitative.js";

export function ScaleIdentity(key, channels, options) {
  let type = "quantitative";
  for (const c of channels) {
    for (const v of c.value) {
      if (typeof v === "string") {
        type = "ordinal";
        break;
      }
    }
  }
  switch (type) {
    case "ordinal":
      return ScaleO(Object.assign(x => x, { domain: () => {} }), channels, options);
    case "quantitative":
      return ScaleQ(key, scaleIdentity(), channels, options);
  }
}
