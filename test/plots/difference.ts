import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function readStocks(start = 0, end = Infinity) {
  return (
    await Promise.all(
      ["AAPL", "GOOG"].map((symbol) =>
        d3.csv<any>(`data/${symbol.toLowerCase()}.csv`, (d, i) =>
          start <= i && i < end ? ((d.Symbol = symbol), d3.autoType(d)) : null
        )
      )
    )
  ).flat();
}

// Here we compare the normalized performance of Apple and Google stock; green
// represents Apple outperforming, while blue represents Google outperforming.
export async function differenceY() {
  const stocks = await readStocks();
  return Plot.plot({
    marks: [
      Plot.differenceY(
        stocks,
        Plot.normalizeY(
          Plot.groupX(
            {y1: Plot.find((d) => d.Symbol === "GOOG"), y2: Plot.find((d) => d.Symbol === "AAPL")},
            {x: "Date", y: "Close", tip: true}
          )
        )
      )
    ]
  });
}

export async function differenceYRandom() {
  const random = d3.randomLcg(42);
  let sum = 3;
  const cumsum = () => (sum += random() - 0.5);
  return Plot.differenceY({length: 60}, {y1: cumsum, y2: cumsum, curve: "natural", tip: true}).plot();
}

export async function differenceYCurve() {
  const stocks = await readStocks(60, 100);
  return Plot.plot({
    marks: [
      Plot.differenceY(
        stocks,
        Plot.normalizeY(
          Plot.groupX(
            {y1: Plot.find((d) => d.Symbol === "GOOG"), y2: Plot.find((d) => d.Symbol === "AAPL")},
            {x: "Date", y: "Close", curve: "cardinal", tension: 0.1}
          )
        )
      )
    ]
  });
}

export async function differenceYVariable() {
  const stocks = await readStocks();
  return Plot.plot({
    marks: [
      Plot.differenceY(
        stocks,
        Plot.normalizeY(
          Plot.groupX(
            {y1: Plot.find((d) => d.Symbol === "GOOG"), y2: Plot.find((d) => d.Symbol === "AAPL")},
            {x: "Date", y: "Close", negativeFill: "#eee", positiveFill: ([d]) => d.Date.getUTCFullYear()}
          )
        )
      )
    ]
  });
}

export async function differenceYConstant() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.differenceY(aapl, {x: "Date", y1: 115, y2: "Close"}).plot();
}

export async function differenceYReverse() {
  const gistemp = await d3.csv<any>("data/gistemp.csv", d3.autoType);
  return Plot.differenceY(gistemp, Plot.windowY(28, {x: "Date", y: "Anomaly"})).plot({y: {reverse: true}});
}

export async function differenceYZero() {
  const gistemp = await d3.csv<any>("data/gistemp.csv", d3.autoType);
  return Plot.differenceY(gistemp, Plot.windowY(28, {x: "Date", y: "Anomaly"})).plot();
}

export async function differenceYNegative() {
  const gistemp = await d3.csv<any>("data/gistemp.csv", d3.autoType);
  return Plot.differenceY(gistemp, Plot.windowY(28, {x: "Date", positiveFill: "none", y: "Anomaly"})).plot();
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
      positiveFillOpacity: 0.2,
      positiveFill: "currentColor",
      negativeFillOpacity: 0.8,
      negativeFill: "red"
    })
  ).plot();
}

function shiftX(interval, options) {
  return Plot.map(
    {
      x1(D) {
        const max = interval.offset(d3.max(D), -1);
        return D.map((d) => (max < d ? null : interval.offset(d, 1)));
      },
      x2(D) {
        const min = interval.offset(d3.min(D), 1);
        return D.map((d) => (d < min ? null : d));
      }
    },
    options
  );
}

export async function differenceFilterX() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d, i) => (200 <= i && i < 400 ? NaN : d.Date));
  const y1 = goog.map((d, i, data) => d.Close / data[0].Close);
  const y2 = aapl.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}

export async function differenceFilterY1() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = goog.map((d, i, data) => d.Close / data[0].Close);
  const y2 = aapl.map((d, i, data) => (200 <= i && i < 400 ? NaN : d.Close / data[0].Close));
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}

export async function differenceFilterY2() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = goog.map((d, i, data) => (200 <= i && i < 400 ? NaN : d.Close / data[0].Close));
  const y2 = aapl.map((d, i, data) => d.Close / data[0].Close);
  return Plot.differenceY(aapl, {x, y1, y2}).plot();
}
