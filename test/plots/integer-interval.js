import * as Plot from "@observablehq/plot";

export default async function() {
  const requests = [[2,9],[3,17],[5,12]];
  return Plot.plot({
    // Since these numbers represent years, we want to format them without the comma
    // TODO: this should be automatic, even for a continuous scale
    x: {interval: 1, label: null, inset: 30},
    y: {label: null, zero: true},
    marks: [
      Plot.lineY(requests, {x: "0", y: "1"})
    ]
  });
}
