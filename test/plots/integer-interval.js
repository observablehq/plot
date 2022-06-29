import * as Plot from "@observablehq/plot";

export default async function () {
  const requests = [
    [2, 9],
    [3, 17],
    [3.5, 10],
    [5, 12]
  ];
  return Plot.plot({
    x: {
      interval: 1
    },
    y: {
      zero: true
    },
    marks: [Plot.line(requests)]
  });
}
