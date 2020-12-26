import * as Plot from "@observablehq/plot";
import {ascending, descending, mean, rollups} from "d3-array";

// TODO consolidate bars into Other category
export function chooseOne(responses, y, title) {
  return bars(
    rollups(responses, group => group.length / responses.length, d => d[y]),
    title
  );
}

export function chooseMany(responses, y, title) {
  return bars(
    Array.from(
      new Set(responses.flatMap(d => d[y])),
      v => [v, mean(responses, d => d[y].includes(v))]
    ),
    title
  );
}

function bars(groups, title) {
  return Plot.plot({
    marginLeft: 300,
    width: 960,
    height: groups.length * 20 + 50,
    x: {
      grid: true,
      axis: "top",
      domain: [0, 100],
      label: "Frequency (%) →"
    },
    y: {
      padding: 0,
      label: title,
      labelAnchor: "top",
      domain: groups.map(([key, value]) => [key, value])
        .sort(([ak, av], [bk, bv]) => descending(av, bv) || ascending(ak, bk))
        .map(([key]) => key)
    },
    marks: [
      Plot.barX(groups, {
        x: ([, value]) => value * 100,
        y: ([key]) => key,
        fill: "steelblue",
        insetTop: 1
      }),
      Plot.ruleX([0])
    ]
  });
}
