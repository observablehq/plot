import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

// Tanner's bug https://github.com/observablehq/plot/issues/1365
test(async function autoLineZero() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: {value: "unemployed", zero: true}, color: "industry"}).plot();
});

// Jeff's bug https://github.com/observablehq/plot/issues/1340
test(async function autoBarNonZeroReducer() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, mark: "bar"}).plot();
});

test(async function autoHistogram() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "weight"}).plot();
});

test(async function autoHistogramDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth"}).plot();
});

test(async function autoHistogramGroup() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island"}).plot();
});

test(async function autoNullReduceContinuous() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: {reduce: null}}).plot();
});

test(async function autoNullReduceOrdinal() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: {reduce: null}}).plot();
});

test(async function autoNullReduceDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {reduce: null}}).plot();
});

test(async function autoLineHistogram() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Volume", mark: "line"}).plot();
});

test(async function autoLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close"}).plot();
});

test(async function autoArea() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", mark: "area"}).plot();
});

test(async function autoAreaColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "Close", mark: "area"}).plot();
});

test(async function autoAreaColorValue() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: {value: "Close"}, mark: "area"}).plot();
});

test(async function autoAreaColorName() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "red", mark: "area"}).plot();
});

test(async function autoAreaColorColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: {color: "red"}, mark: "area"}).plot();
});

test(async function autoDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g"}).plot();
});

test(async function autoDotOrdinal() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "sex", y: "nationality"}).plot();
});

test(async function autoDotOrdCont() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "species"}).plot();
});

test(async function autoDotZero() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.auto(alphabet, {x: {value: "frequency", zero: true}, y: "letter"}).plot();
});

test(async function autoBar() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.auto(alphabet, {x: "frequency", y: "letter", mark: "bar"}).plot();
});

const timeSeries = [
  {date: new Date("2023-04-01"), type: "triangle", value: 5},
  {date: new Date("2023-04-05"), type: "circle", value: 7},
  {date: new Date("2023-04-10"), type: "circle", value: 8},
  {date: new Date("2023-04-15"), type: "circle", value: 3},
  {date: new Date("2023-04-15"), type: "triangle", value: 7},
  {date: new Date("2023-04-20"), type: "triangle", value: 4},
  {date: new Date("2023-04-25"), type: "square", value: 5}
];

test(async function autoBarTimeSeries() {
  return Plot.auto(timeSeries, {x: "date", y: "value", color: "type", mark: "bar"}).plot({x: {type: "band"}}); // TODO suppress warning?
});

test(async function autoBarTimeSeriesReduce() {
  return Plot.auto(timeSeries, {x: "date", y: {value: "value", reduce: "sum"}, color: "type", mark: "bar"}).plot();
});

test(async function autoConnectedScatterplot() {
  const driving = await d3.csv<any>("data/driving.csv", d3.autoType);
  return Plot.auto(driving, {x: "miles", y: "gas", mark: "line"}).plot();
});

// shouldnt make a line
test(async function autoDotUnsortedDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: "height"}).plot();
});

test(async function autoDotSize() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", size: "Volume"}).plot();
});

test(async function autoDotSize2() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", size: "body_mass_g"}).plot();
});

test(async function autoDotGroup() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: "species", size: "count"}).plot();
});

test(async function autoDotBin() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g", size: "count"}).plot();
});

test(async function autoDotColor() {
  const cars = await d3.csv<any>("data/cars.csv", d3.autoType);
  return Plot.auto(cars, {x: "power (hp)", y: "weight (lb)", color: "0-60 mph (s)"}).plot();
});

test(async function autoHeatmapOrdCont() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "species", color: "count"}).plot();
});

test(async function autoHeatmap() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g", color: "count"}).plot();
});

test(async function autoHeatmapOrdinal() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: "species", color: "count"}).plot();
});

test(async function autoBarStackColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {y: "species", color: "sex"}).plot();
});

test(async function autoBarColorReducer() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {y: "species", color: "count"}).plot();
});

test(async function autoRectStackColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", color: "island"}).plot();
});

test(async function autoRectColorReducer() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", color: {value: "island", reduce: "mode"}}).plot();
});

test(async function autoRuleZero() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, mark: "rule"}).plot();
});

test(async function autoLineColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "Close"}).plot();
});

test(async function autoLineColorSeries() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", color: "industry"}).plot();
});

test(async function autoAreaStackColor() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", color: "industry", mark: "area"}).plot();
});

test(async function autoAutoHistogram() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "temp_max", mark: "area"}).plot();
});

test(async function autoBarStackColorField() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "height", color: {value: "gold"}}).plot();
});

test(async function autoBarStackColorConstant() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "height", color: "gold"}).plot();
});

test(async function autoBarMode() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: {value: "species", reduce: "mode"}, mark: "bar"}).plot();
});

test(async function autoLineMean() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "date", y: {value: "temp_max", reduce: "mean"}}).plot();
});

test(async function autoLineMeanZero() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "date", y: {value: "temp_max", reduce: "mean", zero: true}}).plot();
});

test(async function autoLineMeanColor() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, color: "sex"}).plot();
});

test(async function autoLineMeanThresholds() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: {value: "date", thresholds: "month"}, y: {value: "temp_max", reduce: "mean"}}).plot();
});

test(async function autoLineFacet() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", fy: "industry"}).plot();
});

test(async function autoDotFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "body_mass_g", y: "culmen_length_mm", fx: "island", color: "sex"}).plot();
});

test(async function autoDotFacet2() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {
    x: "body_mass_g",
    y: "culmen_length_mm",
    fx: "island",
    fy: "species",
    color: "sex"
  }).plot();
});

test(async function autoChannels() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: Plot.valueof(athletes, "height"), y: Plot.valueof(athletes, "sport")}).plot();
});

test(async function autoBarNoReducer() {
  const simpsons = await d3.csv<any>("data/simpsons.csv", d3.autoType);
  return Plot.auto(simpsons, {x: "season", y: "number_in_season", color: "imdb_rating", mark: "bar"}).plot();
});
