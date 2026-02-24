import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";

export async function crosshairDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 160,
    marks: [
      Plot.dot(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"})),
      Plot.crosshairX(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"}))
    ]
  });
}

export async function crosshairDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
      Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
    ]
  });
}

export async function crosshairDotFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fy: "species", stroke: "sex"}),
      Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fy: "species"})
    ]
  });
}

export async function crosshairHexbin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.hexagon(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"})),
      Plot.crosshair(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"}))
    ]
  });
}

export async function crosshairLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 60,
    marginRight: 40,
    marks: [Plot.lineY(aapl, {x: "Date", y: "Close"}), Plot.crosshairX(aapl, {x: "Date", y: "Close"})]
  });
}

export async function crosshairContinuousX() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    height: 270,
    x: {nice: true},
    marks: [
      Plot.lineY(aapl, {x: "Date", y: "Close"}),
      Plot.gridX(Plot.pointerX({ticks: 1000, ariaLabel: `crosshair-x tick`})),
      Plot.axisX(
        Plot.pointerX({
          ticks: 1000,
          ariaLabel: `crosshair-x label`,
          tickFormat: `%Y\n%b`,
          textStroke: "var(--plot-background)",
          textStrokeWidth: 5,
          tickSize: 0
        })
      )
    ]
  });
}

function formatValue(v: any) {
  if (v == null) return String(v);
  return (
    "{\n" +
    Object.entries(v)
      .map(([k, d]) => `  ${k}: ${d instanceof Date ? d.toISOString() : JSON.stringify(d)}`)
      .join(",\n") +
    "\n}"
  );
}

export async function crosshairDataless() {
  const crosshair = Plot.crosshair();
  const plot = crosshair.plot({
    x: {type: "utc", domain: [new Date("2010-01-01"), new Date("2025-01-01")]},
    y: {domain: [0, 100]},
    marks: [Plot.frame(), Plot.gridX({tickSpacing: 25}), Plot.gridY({tickSpacing: 25})]
  });
  const textarea = html`<textarea rows=4 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = formatValue(plot.value));
  plot.oninput = oninput;
  crosshair.move({x: new Date("2018-03-15"), y: 74.5});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function crosshairDatalessFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const crosshair = Plot.crosshair();
  const plot = crosshair.plot({
    inset: 10,
    grid: true,
    marks: [Plot.frame(), Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"})]
  });
  const textarea = html`<textarea rows=5 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = formatValue(plot.value));
  plot.oninput = oninput;
  crosshair.move({x: 45, y: 17, fx: "Chinstrap"});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function crosshairDatalessOrdinal() {
  const letters = Array.from("abcdefghijklmnopqrstuvwxyz", (d) => ({
    letter: d,
    type: "aeiou".includes(d) ? "vowel" : "consonant"
  }));
  const crosshair = Plot.crosshair();
  const plot = Plot.plot({
    marginLeft: 60,
    label: null,
    y: {type: "point"},
    marks: [
      Plot.axisX({fillOpacity: 0.5}),
      Plot.axisY({fillOpacity: 0.5}),
      Plot.dot(letters, {x: "letter", y: "type", fill: "type", r: 5}),
      crosshair
    ]
  });
  const textarea = html`<textarea rows=4 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = formatValue(plot.value));
  plot.oninput = oninput;
  crosshair.move({x: "e", y: "consonant"});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function crosshairDatalessLog() {
  const crosshair = Plot.crosshair();
  // TODO: replace with proper symlog ticks once https://github.com/d3/d3-scale/issues/162 is fixed
  const ticks = [-100000, -20000, -5000, -500, -100, -20, -5, 0, 5, 20, 100, 500, 5000, 20000, 100000];
  const plot = crosshair.plot({
    x: {type: "symlog", domain: [-100000, 100000], ticks},
    y: {type: "log", domain: [0.1, 10000]},
    grid: true,
    marks: [Plot.frame()]
  });
  const textarea = html`<textarea rows=4 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = formatValue(plot.value));
  plot.oninput = oninput;
  crosshair.move({x: -3000, y: 42});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}
