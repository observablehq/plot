import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Here we compare the normalized performance of Apple and Google stock; green
// represents Apple outperforming, while blue represents Google outperforming.
export async function differenceY() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1: {value: y1, label: "Close"}, y2, tip: true}).plot();
}

export async function differenceYRandom() {
  const random = d3.randomLcg(42);
  let sum = 3;
  const cumsum = () => (sum += random() - 0.5);
  return Plot.differenceY({length: 60}, {y1: cumsum, y2: cumsum, curve: "natural", tip: true}).plot();
}

export async function differenceYCurve() {
  const aapl = (await d3.csv<any>("data/aapl.csv", d3.autoType)).slice(60, 100);
  const goog = (await d3.csv<any>("data/goog.csv", d3.autoType)).slice(60, 100);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1, y2, curve: "cardinal", tension: 0.1}).plot();
}

export async function differenceYVariable() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {
    x,
    y1,
    y2,
    negativeColor: "#eee",
    positiveColor: (d) => d.Date.getUTCFullYear(),
    tip: true
  }).plot();
}

// Here we shift x2 forward to show year-over-year growth; to suppress the year
// before and the year after the dataset, x1 and x2 are padded with null.
export async function differenceY1() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.differenceY(
    aapl,
    shiftX(d3.utcYear, {
      x: "Date",
      y: "Close",
      positiveOpacity: 0.2,
      positiveColor: "currentColor",
      negativeOpacity: 0.8,
      negativeColor: "red"
    })
  ).plot();
}

function shiftX(interval, options) {
  return Plot.map(
    {
      x1(D) {
        const min = interval.offset(d3.min(D), 1);
        return D.map((d) => (d < min ? null : d));
      },
      x2(D) {
        const max = interval.offset(d3.max(D), -1);
        return D.map((d) => (max < d ? null : interval.offset(d, 1)));
      }
    },
    options
  );
}

export async function differenceFilterX() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d, i) => (200 <= i && i < 400 ? NaN : d.Date));
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}

export async function differenceFilterY1() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => (200 <= i && i < 400 ? NaN : d.Close / data[0].Close));
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}

export async function differenceFilterY2() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => (200 <= i && i < 400 ? NaN : d.Close / data[0].Close));
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}
