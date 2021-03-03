import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const wide = await d3.csv("data/police-deaths.csv", d3.autoType);
  const columns = wide.columns.slice(1);
  const data = columns.flatMap(type => wide.map(d => ({race: d.race, type, value: d[type]})));
  const stack = {x: "type", y: "value", z: "race", order: d3.sort(wide, d => d.police).map(d => d.race)};
  return Plot.plot({
    marginLeft: 100,
    marginRight: 100,
    x: {
      domain: columns,
      axis: "top",
      label: "",
      tickFormat: d => d === "population" ? "Share of population" : "Share of deaths by police",
      padding: 0 // see margins
    },
    y: {
      axis: null
    },
    marks: [
      Plot.stackAreaY(data, {
        ...stack,
        curve: curveLinkHorizontal,
        fill: "race",
        stroke: "white"
      }),
      Plot.text(
        data.filter(d => d.type === "police"),
        Plot.stackYMid({
          ...stack,
          text: d => `${d.race} ${d.value}%`,
          textAnchor: "end",
          dx: -6
        })
      ),
      Plot.text(
        data.filter(d => d.type === "population"),
        Plot.stackYMid({
          ...stack,
          text: d => `${d.race} ${d.value}%`,
          textAnchor: "start",
          dx: +6
        })
      )
    ]
  });
}

// https://github.com/d3/d3-shape/issues/152
function curveLinkHorizontal(context) {
  let line, point, x0, y0;
  return {
    areaStart() {
      line = 0;
    },
    areaEnd() {
      line = NaN;
    },
    lineStart() {
      point = 0;
    },
    lineEnd() {
      if (line || (line !== 0 && point === 1)) context.closePath();
      line = 1 - line;
    },
    point(x, y) {
      x = +x, y = +y;
      switch (point) {
        case 0: {
          point = 1;
          if (line) context.lineTo(x, y);
          else context.moveTo(x, y);
          break;
        }
        case 1: point = 2; // eslint-disable-line no-fallthrough
        default: {
          x0 = (x0 + x) / 2;
          context.bezierCurveTo(x0, y0, x0, y, x, y);
          break;
        }
      }
      x0 = x, y0 = y;
    }
  };
}
