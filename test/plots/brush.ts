// The programmatic brush.move calls below use the private _brush and
// _brushNodes API with pixel coordinates. Replace with the public setter
// (in data space) when available.
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoProject} from "d3-geo-projection";
import {feature, mesh} from "topojson-client";
import {html} from "htl";

function formatValue(v: any) {
  if (v == null) return JSON.stringify(v);
  const o: any = {};
  for (const [k, val] of Object.entries(v)) {
    o[k] = typeof val === "function" ? `${k}(${paramNames(val)})` : val;
  }
  return JSON.stringify(o, null, 2);
}

function paramNames(fn: (...args: any[]) => any) {
  const s = fn.toString();
  const m = s.match(/^\(([^)]*)\)|^([^=]+?)(?=\s*=>)/);
  return m ? (m[1] ?? m[2]).trim() : "…";
}

export async function brushDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const};
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "species", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.focus({...xy, fill: "species", r: 3, pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[0]).call((brush as any)._brush.move, [[80, 40], [300, 200]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushFaceted() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const, fx: "species" as const};
  const plot = Plot.plot({
    marks: [
      Plot.frame(),
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "sex", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.focus({...xy, fill: "sex", r: 3, pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[1]).call((brush as any)._brush.move, [[60, 80], [180, 280]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushFacetedFy() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const, fy: "species" as const};
  const plot = Plot.plot({
    marks: [
      Plot.frame(),
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "sex", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.focus({...xy, fill: "sex", r: 3, pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[1]).call((brush as any)._brush.move, [[100, 40], [400, 120]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushFacetedFxFy() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const, fx: "species" as const, fy: "sex" as const};
  const plot = Plot.plot({
    marks: [
      Plot.frame(),
      brush,
      Plot.dot(penguins, brush.inactive({...xy, r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2, pointerEvents: "none"})),
      Plot.dot(penguins, brush.focus({...xy, fill: "red", r: 3, pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species, d.sex)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[2]).call((brush as any)._brush.move, [[60, 50], [170, 140]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushGeoUS() {
  const proj = d3.geoAlbersUsa();
  const us = await d3.json<any>("data/us-counties-10m.json");
  const flipY = d3.geoTransform({point(x, y) { this.stream.point(x, -y); }});
  const nation = geoProject(geoProject(feature(us, us.objects.nation), proj), flipY);
  const statemesh = geoProject(geoProject(mesh(us, us.objects.states, (a: any, b: any) => a !== b), proj), flipY);
  const capitals = (await d3.csv<any>("data/us-state-capitals.csv", d3.autoType))
    .map((d: any) => {
      const p = proj([d.longitude, d.latitude]);
      return p ? {...d, px: p[0], py: -p[1]} : null;
    })
    .filter((d: any) => d);
  const brush = new Plot.Brush();
  const plot = Plot.plot({
    projection: {type: "reflect-y", domain: nation, inset: 10},
    marks: [
      Plot.geo(nation, {stroke: "#ccc"}),
      Plot.geo(statemesh, {stroke: "#ccc"}),
      brush,
      Plot.dot(capitals, brush.inactive({x: "px", y: "py", r: 3, fill: "#ccc", pointerEvents: "none"})),
      Plot.dot(capitals, brush.context({x: "px", y: "py", r: 2, fill: "#ccc", pointerEvents: "none"})),
      Plot.dot(capitals, brush.focus({x: "px", y: "py", r: 4, fill: "red", pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? capitals.filter((d: any) => v.filter(d.px, d.py)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${capitals.length}` + (filtered.length ? `\n${filtered.map((d: any) => d.capital).join(", ")}` : "");
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[0]).call((brush as any)._brush.move, [[80, 60], [300, 220]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushGeoWorld() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  const cities = (await d3.csv<any>("data/cities-10k.csv", d3.autoType)).filter((d: any) => d.population > 500000);
  const brush = new Plot.Brush();
  const plot = Plot.plot({
    projection: "equal-earth",
    marks: [
      Plot.geo(land),
      Plot.sphere(),
      brush,
      Plot.dot(cities, brush.inactive({x: "longitude", y: "latitude", r: 2, fill: "#999", pointerEvents: "none"})),
      Plot.dot(cities, brush.context({x: "longitude", y: "latitude", r: 1, fill: "#999", pointerEvents: "none"})),
      Plot.dot(cities, brush.focus({x: "longitude", y: "latitude", r: 3, fill: "red", pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? cities.filter((d: any) => v.filter(d.longitude, d.latitude)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${cities.length}` + (filtered.length ? `\n${filtered.map((d: any) => d.name).join(", ")}` : "");
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[0]).call((brush as any)._brush.move, [[80, 60], [300, 200]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushGeoWorldFaceted() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  const cities = (await d3.csv<any>("data/cities-10k.csv", d3.autoType)).filter((d: any) => d.population > 500000);
  const median = d3.median(cities, (d: any) => d.population)!;
  const brush = new Plot.Brush();
  const xy = {x: "longitude" as const, y: "latitude" as const, fy: (d: any) => d.population >= median ? "≥ median" : "< median"};
  const plot = Plot.plot({
    projection: "equal-earth",
    marginRight: 80,
    fy: {axis: "right"},
    marks: [
      Plot.frame(),
      Plot.geo(land),
      Plot.sphere(),
      brush,
      Plot.dot(cities, brush.inactive({...xy, r: 2, fill: "#999", pointerEvents: "none"})),
      Plot.dot(cities, brush.context({...xy, r: 1, fill: "#999", pointerEvents: "none"})),
      Plot.dot(cities, brush.focus({...xy, r: 3, fill: "red", pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const fy = (d: any) => d.population >= median ? "≥ median" : "< median";
    const filtered = v?.filter ? cities.filter((d: any) => v.filter(d.longitude, d.latitude, fy(d))) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${cities.length}` + (filtered.length ? `\n${filtered.map((d: any) => d.name).join(", ")}` : "");
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[1]).call((brush as any)._brush.move, [[80, 30], [300, 150]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushRandomNormal() {
  const random = d3.randomNormal.source(d3.randomLcg(42))();
  const data = Array.from({length: 1000}, () => [random(), random()] as [number, number]);
  const brush = new Plot.Brush();
  const xy = {x: "0" as const, y: "1" as const};
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(data, brush.inactive({...xy, fillOpacity: 0.5, pointerEvents: "none"})),
      Plot.dot(data, brush.context({...xy, fill: "#ccc", fillOpacity: 0.5, pointerEvents: "none"})),
      Plot.dot(data, brush.focus({...xy, fill: "red", fillOpacity: 0.5, pointerEvents: "none"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? data.filter((d) => v.filter(d[0], d[1])) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${data.length}`;
  };
  plot.oninput = oninput;
  d3.select((brush as any)._brushNodes[0]).call((brush as any)._brush.move, [[100, 60], [350, 250]]);
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushSimple() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const plot = Plot.plot({
    marks: [Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}), Plot.brush()]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  oninput();
  plot.oninput = oninput;
  return html`<figure>${plot}${textarea}</figure>`;
}
