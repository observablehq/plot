import * as Plot from "@observablehq/plot";

export async function yearlyRequestsLine() {
  const requests = [
    [2002, 9],
    [2003, 17],
    [2004, 12],
    [2005, 5],
    [2006, 12],
    [2007, 18],
    [2008, 16],
    [2009, 11],
    [2010, 9],
    [2011, 8],
    [2012, 9],
    [2019, 20]
  ];
  return Plot.plot({
    label: null,
    x: {
      interval: 1,
      tickFormat: "", // TODO https://github.com/observablehq/plot/issues/768
      inset: 20
    },
    y: {
      zero: true
    },
    marks: [Plot.line(requests)]
  });
}
