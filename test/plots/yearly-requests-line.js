import * as Plot from "@observablehq/plot";

export default async function() {
  const requests = [[2002,9],[2003,17],[2004,12],[2005,5],[2006,12],[2007,18],[2008,16],[2009,11],[2010,9],[2011,8],[2012,9],[2019,20]];
  return Plot.plot({
    // Since these numbers represent years, we want to format them without the comma
    // TODO: this should be automatic, even for a continuous scale
    x: {interval: 1, label: null, inset: 20, tickFormat: ""},
    y: {label: null, zero: true},
    marks: [
      Plot.lineY(requests, {x: "0", y: "1"})
    ]
  });
}
