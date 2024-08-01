import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const demographics = d3.csvParse(
  `group,label,freq
Infants <1,0-1,16467
Children <11,1-11,30098
Teens 12-17,12-17,20354
Adults 18+,18+,12456
Elderly 65+,65+,12456`,
  d3.autoType
);

export function waffleShorthand() {
  return Plot.waffleY([4, 9, 24, 46, 66, 7]).plot();
}

export function waffleShorthandNegative() {
  return Plot.waffleY([-4, -9, -24, -46, -66, -7]).plot({x: {axis: "top"}});
}

export function waffleX() {
  return Plot.plot({
    marginLeft: 80,
    x: {axis: "top"},
    y: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.waffleX(demographics, {y: "group", fill: "group", x: (d) => d.freq / 100, sort: {y: null, color: null}}),
      Plot.ruleX([0])
    ]
  });
}

export function waffleXStacked() {
  return Plot.plot({
    height: 240,
    color: {scheme: "cool"},
    marks: [Plot.waffleX(demographics, {fill: "group", x: (d) => d.freq / 100, sort: {color: null}}), Plot.ruleX([0])]
  });
}

export function waffleY() {
  return Plot.plot({
    x: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.waffleY(demographics, {x: "group", fill: "group", y: (d) => d.freq / 100, sort: {x: null, color: null}}),
      Plot.ruleY([0])
    ]
  });
}

export function waffleYStacked() {
  return Plot.plot({
    x: {label: null},
    color: {scheme: "cool", legend: true},
    marks: [Plot.waffleY(demographics, {fill: "group", y: (d) => d.freq / 100, sort: {color: null}}), Plot.ruleY([0])]
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
