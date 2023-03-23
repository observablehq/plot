import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Tanner's bug https://github.com/observablehq/plot/issues/1365
export async function autoLineZero() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: {value: "unemployed", zero: true}, color: "industry"}).plot();
}

// Jeff's bug https://github.com/observablehq/plot/issues/1340
export async function autoBarNonZeroReducer() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, mark: "bar"}).plot();
}

export async function autoHistogram() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "weight"}).plot();
}

export async function autoHistogramDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth"}).plot();
}

export async function autoHistogramGroup() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island"}).plot();
}

export async function autoNullReduceContinuous() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: {reduce: null}}).plot();
}

export async function autoNullReduceOrdinal() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: {reduce: null}}).plot();
}

export async function autoNullReduceDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {reduce: null}}).plot();
}

export async function autoLineHistogram() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Volume", mark: "line"}).plot();
}

export async function autoLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close"}).plot();
}

export async function autoArea() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", mark: "area"}).plot();
}

export async function autoAreaColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "Close", mark: "area"}).plot();
}

export async function autoAreaColorValue() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: {value: "Close"}, mark: "area"}).plot();
}

export async function autoAreaColorName() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "red", mark: "area"}).plot();
}

export async function autoAreaColorColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: {color: "red"}, mark: "area"}).plot();
}

export async function autoDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g"}).plot();
}

export async function autoDotOrdinal() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "sex", y: "nationality"}).plot();
}

export async function autoDotOrdCont() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "species"}).plot();
}

export async function autoDotZero() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.auto(alphabet, {x: {value: "frequency", zero: true}, y: "letter"}).plot();
}

export async function autoBar() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.auto(alphabet, {x: "frequency", y: "letter", mark: "bar"}).plot();
}

export async function autoConnectedScatterplot() {
  const driving = await d3.csv<any>("data/driving.csv", d3.autoType);
  return Plot.auto(driving, {x: "miles", y: "gas", mark: "line"}).plot();
}

// shouldnt make a line
export async function autoDotUnsortedDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: "height"}).plot();
}

export async function autoDotSize() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", size: "Volume"}).plot();
}

export async function autoDotSize2() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", size: "body_mass_g"}).plot();
}

export async function autoDotGroup() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: "species", size: "count"}).plot();
}

export async function autoDotBin() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g", size: "count"}).plot();
}

export async function autoDotColor() {
  const cars = await d3.csv<any>("data/cars.csv", d3.autoType);
  return Plot.auto(cars, {x: "power (hp)", y: "weight (lb)", color: "0-60 mph (s)"}).plot();
}

export async function autoHeatmapOrdCont() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "species", color: "count"}).plot();
}

export async function autoHeatmap() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", y: "body_mass_g", color: "count"}).plot();
}

export async function autoHeatmapOrdinal() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: "species", color: "count"}).plot();
}

export async function autoBarStackColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {y: "species", color: "sex"}).plot();
}

export async function autoBarColorReducer() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {y: "species", color: "count"}).plot();
}

export async function autoRectStackColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", color: "island"}).plot();
}

export async function autoRectColorReducer() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "culmen_length_mm", color: {value: "island", reduce: "mode"}}).plot();
}

export async function autoRuleZero() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, mark: "rule"}).plot();
}

export async function autoLineColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.auto(aapl, {x: "Date", y: "Close", color: "Close"}).plot();
}

export async function autoLineColorSeries() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", color: "industry"}).plot();
}

export async function autoAreaStackColor() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", color: "industry", mark: "area"}).plot();
}

export async function autoAutoHistogram() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "temp_max", mark: "area"}).plot();
}

export async function autoBarStackColorField() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "height", color: {value: "gold"}}).plot();
}

export async function autoBarStackColorConstant() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "height", color: "gold"}).plot();
}

export async function autoBarMode() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "island", y: {value: "species", reduce: "mode"}, mark: "bar"}).plot();
}

export async function autoLineMean() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "date", y: {value: "temp_max", reduce: "mean"}}).plot();
}

export async function autoLineMeanZero() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: "date", y: {value: "temp_max", reduce: "mean", zero: true}}).plot();
}

export async function autoLineMeanColor() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, color: "sex"}).plot();
}

export async function autoLineMeanThresholds() {
  const weather = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.auto(weather, {x: {value: "date", thresholds: "month"}, y: {value: "temp_max", reduce: "mean"}}).plot();
}

export async function autoLineFacet() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.auto(industries, {x: "date", y: "unemployed", fy: "industry"}).plot();
}

export async function autoDotFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {x: "body_mass_g", y: "culmen_length_mm", fx: "island", color: "sex"}).plot();
}

export async function autoDotFacet2() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.auto(penguins, {
    x: "body_mass_g",
    y: "culmen_length_mm",
    fx: "island",
    fy: "species",
    color: "sex"
  }).plot();
}

export async function autoChannels() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: Plot.valueof(athletes, "height"), y: Plot.valueof(athletes, "sport")}).plot();
}
