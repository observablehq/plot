import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {svg} from "htl";

const demographics = d3.csvParse(
  `group,label,freq
Infants <1,0-1,16467
Children <11,1-11,30098
Teens 12-17,12-17,20354
Adults 18+,18+,12456
Elderly 65+,65+,12456`,
  d3.autoType
);

export function waffleSquished() {
  return Plot.waffleX([10]).plot();
}

export function waffleMultiple() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {multiple: 10, fill: "currentColor"}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {multiple: 10, fill: "red"})
    ]
  });
}

export function waffleShorthand() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor"}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red"})
    ]
  });
}

export function waffleStroke() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor", stroke: "red", gap: 0}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red", stroke: "currentColor", gap: 0})
    ]
  });
}

export function waffleRound() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor", rx: "100%"}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red", rx: "100%"})
    ]
  });
}

export function waffleStrokeMixed() {
  return Plot.plot({
    y: {insetBottom: 16},
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleStrokeNegative() {
  return Plot.plot({
    x: {axis: "top"},
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: 0,
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: [-2.3, -4.5, -6.7, -7.8, -9.1, -10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: 0,
          gap: 10,
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-2.3, -4.5, -6.7, -7.8, -9.1, -10.2],
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleStrokePositive() {
  return Plot.plot({
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: 0,
          y2: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          y2: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          y2: 0,
          gap: 10,
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          y2: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleX() {
  return Plot.plot({
    marginLeft: 80,
    y: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.axisX({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleX(demographics, {y: "group", fill: "group", x: "freq", unit: 100, sort: {y: null, color: null}}),
      Plot.ruleX([0])
    ]
  });
}

export function waffleXStacked() {
  return Plot.plot({
    height: 240,
    color: {scheme: "cool"},
    marks: [
      Plot.axisX({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleX(demographics, {fill: "group", x: "freq", unit: 100, sort: {color: null}}),
      Plot.ruleX([0])
    ]
  });
}

export function waffleY() {
  return Plot.plot({
    x: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.axisY({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleY(demographics, {x: "group", fill: "group", y: "freq", unit: 100, sort: {x: null, color: null}}),
      Plot.ruleY([0])
    ]
  });
}

export function waffleYStacked() {
  return Plot.plot({
    y: {insetTop: 10},
    color: {scheme: "cool", legend: true},
    marks: [
      Plot.axisY({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleY(demographics, {fill: "group", y: "freq", unit: 100, sort: {color: null}}),
      Plot.ruleY([0])
    ]
  });
}

export async function waffleYGrouped() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginBottom: 100,
    x: {tickRotate: -90, label: null},
    marks: [Plot.waffleY(athletes, Plot.groupX({y: "count"}, {x: "sport", unit: 10})), Plot.ruleY([0])]
  });
}

export function wafflePointer() {
  const random = d3.randomLcg(42);
  const data = Array.from({length: 100}, (_, i) => ({x: i % 3, fill: random()}));
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY(data, {x: "x", y: 1, fill: "#888"}),
      Plot.waffleY(data, Plot.pointer({x: "x", y: 1, fill: "fill"}))
    ]
  });
}

export function wafflePointerFractional() {
  const values = [0.51, 0.99, 0.5, 6, 0.3, 1.6, 9.1, 2, 18, 6, 0.5, 2.5, 46, 34, 20, 7, 0.5, 0.1, 0, 2.5, 1, 0.1, 0.8];
  const multiple = 16;
  return Plot.plot({
    axis: null,
    y: {insetTop: 12},
    color: {scheme: "Dark2"},
    marks: [
      Plot.waffleY(values, {
        x: null,
        multiple,
        fill: (d, i) => i % 7,
        tip: true
      }),
      Plot.waffleY(values, {
        x: null,
        multiple,
        // eslint-disable-next-line
        render: (index, scales, values, dimensions, context, next) => {
          const format = (d: number) => +d.toFixed(2);
          const y1 = (values.channels.y1 as any).source.value;
          const y2 = (values.channels.y2 as any).source.value;
          return svg`<g stroke="black" fill="white" paint-order="stroke" stroke-width="3">${Array.from(
            index,
            (i) =>
              svg`<text ${{
                dy: "0.38em",
                x: values.x[i],
                y: values.y1[i]
              }}>${format(y2[i] - y1[i])}</text>`
          )}</g>`;
        }
      })
    ]
  });
}

export function waffleTip() {
  return Plot.plot({
    color: {type: "sqrt", scheme: "spectral"},
    y: {inset: 12},
    marks: [Plot.waffleY([1, 4, 9, 24, 46, 66, 7], {x: null, fill: Plot.identity, tip: true})]
  });
}

export function waffleTipUnit() {
  return Plot.plot({
    y: {inset: 12},
    marks: [Plot.waffleY({length: 100}, {x: (d, i) => i % 3, y: 1, fill: d3.randomLcg(42), tip: true})]
  });
}

export function waffleTipFacet() {
  return Plot.plot({
    marks: [
      Plot.waffleY({length: 500}, {x: (d, i) => i % 3, fx: (d, i) => i % 2, y: 1, fill: d3.randomLcg(42), tip: true})
    ]
  });
}

export function waffleTipX() {
  return Plot.plot({
    style: {overflow: "visible"},
    color: {type: "sqrt", scheme: "spectral"},
    x: {label: "quantity"},
    y: {inset: 12},
    marks: [Plot.waffleX([1, 4, 9, 24, 46, 66, 7], {y: null, fill: Plot.identity, tip: true})]
  });
}

export function waffleTipUnitX() {
  return Plot.plot({
    height: 300,
    y: {inset: 12},
    marks: [
      Plot.waffleX(
        {length: 100},
        {multiple: 5, y: (d, i) => i % 3, x: 1, fill: d3.randomLcg(42), tip: {format: {x: false}}}
      )
    ]
  });
}

export function waffleHref() {
  return Plot.plot({
    inset: 10,
    marks: [
      Plot.waffleY(
        {length: 77},
        {
          y: 1,
          fill: (d, i) => i % 7,
          href: (d, i) => `/?${i}`,
          title: (d, i) => `waffle ${i}`,
          target: "_blank"
        }
      )
    ]
  });
}

export function waffleStrokeWidth() {
  return Plot.plot({
    inset: 10,
    marks: [Plot.waffleY({length: 77}, {y: 1, stroke: (d, i) => i % 7, gap: 15, strokeWidth: 15, strokeOpacity: 0.8})]
  });
}

export function waffleStrokeWidthConst() {
  return Plot.plot({
    inset: 10,
    marks: [Plot.waffleY({length: 77}, {y: 1, stroke: "black", gap: 15, strokeWidth: 15, strokeOpacity: 0.8})]
  });
}

export function waffleTipFacetX() {
  return Plot.plot({
    height: 500,
    marks: [
      Plot.waffleX({length: 500}, {y: (d, i) => i % 3, fx: (d, i) => i % 2, x: 1, fill: d3.randomLcg(42), tip: true})
    ]
  });
}

export function waffleTipFacetXY() {
  return Plot.plot({
    height: 600,
    marks: [
      Plot.waffleX({length: 500}, {fx: (d, i) => i % 3, fy: (d, i) => i % 2, x: 1, fill: d3.randomLcg(42), tip: true})
    ]
  });
}

export function waffleShapes() {
  const k = 10;
  let offset = 0;
  const waffle = (y1, y2) => {
    y1 += offset;
    y2 += offset;
    offset = Math.ceil(y2 / k) * k;
    return Plot.waffleY({length: 1}, {y1, y2, multiple: k, fill: y1, stroke: "black"});
  };
  return Plot.plot({
    height: 1200,
    color: {type: "categorical"},
    y: {domain: [0, 300]},
    marks: [
      Plot.waffleY({length: 1}, {y1: 0, y2: 300, multiple: 10, stroke: "currentColor", strokeOpacity: 0.2, gap: 0}),
      waffle(0, 1),
      waffle(0, 0.5),
      waffle(0.2, 0.8),
      waffle(0.6, 1.4),
      waffle(9.6, 10.4),
      waffle(0.6, 2),
      waffle(1, 2.4),
      waffle(0.6, 2.4),
      waffle(1, 3),
      waffle(9, 11),
      waffle(0.6, 3),
      waffle(1, 3.4),
      waffle(0.6, 3.4),
      waffle(7, 20),
      waffle(7.6, 20),
      waffle(0, 13),
      waffle(0, 12.4),
      waffle(7, 23),
      waffle(7.6, 22.4)
    ]
  });
}
