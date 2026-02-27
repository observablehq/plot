import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoProject} from "d3-geo-projection";
import {feature, mesh} from "topojson-client";
import {html} from "htl";

function formatValue(v: any) {
  if (v == null) return JSON.stringify(v);
  const lines: string[] = [];
  for (const [k, val] of Object.entries(v)) {
    const formatted =
      typeof val === "function"
        ? `${k}(${paramNames(val as (...args: any[]) => any)})`
        : Array.isArray(val)
        ? `Array(${val.length})`
        : JSON.stringify(val);
    lines.push(`  ${k}: ${formatted}`);
  }
  return `{\n${lines.join(",\n")}\n}`;
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
      Plot.dot(penguins, brush.inactive({...xy, fill: "species", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "species", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 36, x2: 48, y1: 15, y2: 20});
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
      Plot.dot(penguins, brush.inactive({...xy, fill: "sex", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "sex", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter
      ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species))
      : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 40, x2: 52, y1: 15, y2: 20, fx: "Chinstrap"});
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
      Plot.dot(penguins, brush.inactive({...xy, fill: "sex", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "sex", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter
      ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species))
      : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 38, x2: 52, y1: 15, y2: 19, fy: "Chinstrap"});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushFacetedFxFy() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {
    x: "culmen_length_mm" as const,
    y: "culmen_depth_mm" as const,
    fx: "species" as const,
    fy: "sex" as const
  };
  const plot = Plot.plot({
    marks: [
      Plot.frame(),
      brush,
      Plot.dot(penguins, brush.inactive({...xy, r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "red", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter
      ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species, d.sex))
      : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 40, x2: 50, y1: 14, y2: 17, fx: "Gentoo", fy: "MALE"});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushGeoUS() {
  const proj = d3.geoAlbersUsa();
  const us = await d3.json<any>("data/us-counties-10m.json");
  const flipY = d3.geoTransform({
    point(x, y) {
      this.stream.point(x, -y);
    }
  });
  const nation = geoProject(geoProject(feature(us, us.objects.nation), proj), flipY);
  const statemesh = geoProject(
    geoProject(
      mesh(us, us.objects.states, (a: any, b: any) => a !== b),
      proj
    ),
    flipY
  );
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
      Plot.dot(capitals, brush.inactive({x: "px", y: "py", r: 3, fill: "#ccc"})),
      Plot.dot(capitals, brush.context({x: "px", y: "py", r: 2, fill: "#ccc"})),
      Plot.dot(capitals, brush.focus({x: "px", y: "py", r: 4, fill: "red"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? capitals.filter((d: any) => v.filter(d.px, d.py)) : [];
    textarea.value =
      formatValue(v) +
      `\nfiltered: ${filtered.length} of ${capitals.length}` +
      (filtered.length ? `\n${filtered.map((d: any) => d.capital).join(", ")}` : "");
  };
  plot.oninput = oninput;
  brush.move({x1: 80, x2: 300, y1: 60, y2: 220});
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
      Plot.dot(cities, brush.inactive({x: "longitude", y: "latitude", r: 2, fill: "#999"})),
      Plot.dot(cities, brush.context({x: "longitude", y: "latitude", r: 1, fill: "#999"})),
      Plot.dot(cities, brush.focus({x: "longitude", y: "latitude", r: 3, fill: "red"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? cities.filter((d: any) => v.filter(d.longitude, d.latitude)) : [];
    textarea.value =
      formatValue(v) +
      `\nfiltered: ${filtered.length} of ${cities.length}` +
      (filtered.length ? `\n${filtered.map((d: any) => d.name).join(", ")}` : "");
  };
  plot.oninput = oninput;
  brush.move({x1: 80, x2: 300, y1: 60, y2: 200});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushGeoWorldFaceted() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  const cities = (await d3.csv<any>("data/cities-10k.csv", d3.autoType)).filter((d: any) => d.population > 500000);
  const median = d3.median(cities, (d: any) => d.population)!;
  const brush = new Plot.Brush();
  const xy = {
    x: "longitude" as const,
    y: "latitude" as const,
    fy: (d: any) => (d.population >= median ? "≥ median" : "< median")
  };
  const plot = Plot.plot({
    projection: "equal-earth",
    marginRight: 80,
    fy: {axis: "right"},
    marks: [
      Plot.frame(),
      Plot.geo(land),
      Plot.sphere(),
      brush,
      Plot.dot(cities, brush.inactive({...xy, r: 2, fill: "#999"})),
      Plot.dot(cities, brush.context({...xy, r: 1, fill: "#999"})),
      Plot.dot(cities, brush.focus({...xy, r: 3, fill: "red"}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const fy = (d: any) => (d.population >= median ? "≥ median" : "< median");
    const filtered = v?.filter ? cities.filter((d: any) => v.filter(d.longitude, d.latitude, fy(d))) : [];
    textarea.value =
      formatValue(v) +
      `\nfiltered: ${filtered.length} of ${cities.length}` +
      (filtered.length ? `\n${filtered.map((d: any) => d.name).join(", ")}` : "");
  };
  plot.oninput = oninput;
  brush.move({x1: 80, x2: 300, y1: 30, y2: 150, fy: "< median"});
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
      Plot.dot(data, brush.inactive({...xy, fillOpacity: 0.5})),
      Plot.dot(data, brush.context({...xy, fill: "#ccc", fillOpacity: 0.5})),
      Plot.dot(data, brush.focus({...xy, fill: "red", fillOpacity: 0.5}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? data.filter((d) => v.filter(d[0], d[1])) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${data.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: -1, x2: 1, y1: -1, y2: 0.5});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushCrossFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brush({sync: true});
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const, fx: "species" as const};
  const plot = Plot.plot({
    marks: [
      Plot.frame(),
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "sex", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "sex", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_length_mm, d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Adelie"});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXHistogram() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brushX();
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.rectY(
        penguins,
        Plot.binX(
          {y: "count"},
          brush.inactive({x: "body_mass_g", thresholds: 40, fill: "currentColor", fillOpacity: 0.8})
        )
      ),
      Plot.rectY(
        penguins,
        Plot.binX(
          {y: "count"},
          brush.context({x: "body_mass_g", thresholds: 40, fill: "currentColor", fillOpacity: 0.3})
        )
      ),
      Plot.rectY(penguins, Plot.binX({y: "count"}, brush.focus({x: "body_mass_g", thresholds: 40}))),
      Plot.ruleY([0])
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const f = v?.filter ? penguins.filter((d: any) => v.filter(d.body_mass_g)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${f.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 3510, x2: 4960});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXHistogramFaceted() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const [min, max] = d3.extent(penguins, (d: any) => d.body_mass_g) as [number, number];
  const interval = d3.tickStep(min, max, 40);
  const brush = Plot.brushX({interval});
  const plot = Plot.plot({
    fy: {label: null},
    y: {grid: true},
    color: {legend: true},
    marks: [
      brush,
      Plot.rectY(
        penguins,
        Plot.binX(
          {y: "count"},
          brush.inactive({x: "body_mass_g", interval, fy: "island", fill: "species", fillOpacity: 0.8})
        )
      ),
      Plot.rectY(
        penguins,
        Plot.binX(
          {y: "count"},
          brush.context({x: "body_mass_g", interval, fy: "island", fill: "species", fillOpacity: 0.3})
        )
      ),
      Plot.rectY(
        penguins,
        Plot.binX({y: "count"}, brush.focus({x: "body_mass_g", interval, fy: "island", fill: "species"}))
      ),
      Plot.ruleY([0])
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const f = v?.filter ? penguins.filter((d: any) => v.filter(d.body_mass_g, d.island)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${f.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 3500, x2: 5000});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXTemporal() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const brush = Plot.brushX({interval: "month"});
  const plot = Plot.plot({
    y: {grid: true},
    marks: [
      brush,
      Plot.rectY(
        aapl,
        Plot.binX(
          {y: "median"},
          brush.inactive({x: "Date", y: "Close", interval: "month", fill: "currentColor", fillOpacity: 0.8})
        )
      ),
      Plot.rectY(
        aapl,
        Plot.binX(
          {y: "median"},
          brush.context({x: "Date", y: "Close", interval: "month", fill: "currentColor", fillOpacity: 0.3})
        )
      ),
      Plot.rectY(aapl, Plot.binX({y: "median"}, brush.focus({x: "Date", y: "Close", interval: "month"}))),
      Plot.ruleY([0])
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const f = v?.filter ? aapl.filter((d: any) => v.filter(d.Date)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${f.length} of ${aapl.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: new Date("2014-06-01"), x2: new Date("2015-06-01")});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXTemporalReversed() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const brush = Plot.brushX({interval: "month"});
  const plot = Plot.plot({
    x: {reverse: true},
    y: {grid: true},
    marks: [
      brush,
      Plot.rectY(
        aapl,
        Plot.binX(
          {y: "median"},
          brush.inactive({x: "Date", y: "Close", interval: "month", fill: "currentColor", fillOpacity: 0.8})
        )
      ),
      Plot.rectY(
        aapl,
        Plot.binX(
          {y: "median"},
          brush.context({x: "Date", y: "Close", interval: "month", fill: "currentColor", fillOpacity: 0.3})
        )
      ),
      Plot.rectY(aapl, Plot.binX({y: "median"}, brush.focus({x: "Date", y: "Close", interval: "month"}))),
      Plot.ruleY([0])
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const f = v?.filter ? aapl.filter((d: any) => v.filter(d.Date)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${f.length} of ${aapl.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: new Date("2014-06-01"), x2: new Date("2015-06-01")});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brushX();
  const plot = Plot.plot({
    height: 170,
    marginTop: 10,
    marks: [
      brush,
      Plot.dot(penguins, Plot.dodgeY(brush.inactive({x: "body_mass_g", fill: "species", r: 3}))),
      Plot.dot(penguins, Plot.dodgeY(brush.context({x: "body_mass_g", fill: "#ccc", r: 3}))),
      Plot.dot(penguins, Plot.dodgeY(brush.focus({x: "body_mass_g", fill: "species", r: 3})))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.body_mass_g)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({x1: 3200, x2: 4800});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushXData() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const values = Plot.valueof(penguins, "body_mass_g");
  const brush = Plot.brushX(values);
  const plot = Plot.plot({
    height: 170,
    marginTop: 10,
    marks: [
      brush,
      Plot.dot(values, Plot.dodgeY(brush.inactive({fill: "currentColor"}))),
      Plot.dot(values, Plot.dodgeY(brush.context({fill: "currentColor", fillOpacity: 0.3}))),
      Plot.dot(values, Plot.dodgeY(brush.focus({fill: "currentColor"})))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    textarea.value = formatValue(plot.value);
  };
  plot.oninput = oninput;
  brush.move({x1: 3200, x2: 4800});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushYDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brushY();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const};
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "species", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "species", r: 3}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const filtered = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({y1: 15, y2: 20});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushYHistogram() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brushY({interval: 0.5});
  const plot = Plot.plot({
    x: {grid: true},
    marks: [
      brush,
      Plot.rectX(
        penguins,
        Plot.binY(
          {x: "count"},
          brush.inactive({y: "culmen_depth_mm", interval: 0.5, fill: "currentColor", fillOpacity: 0.8})
        )
      ),
      Plot.rectX(
        penguins,
        Plot.binY(
          {x: "count"},
          brush.context({y: "culmen_depth_mm", interval: 0.5, fill: "currentColor", fillOpacity: 0.3})
        )
      ),
      Plot.rectX(penguins, Plot.binY({x: "count"}, brush.focus({y: "culmen_depth_mm", interval: 0.5}))),
      Plot.ruleX([0])
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    const f = v?.filter ? penguins.filter((d: any) => v.filter(d.culmen_depth_mm)) : [];
    textarea.value = formatValue(v) + `\nfiltered: ${f.length} of ${penguins.length}`;
  };
  plot.oninput = oninput;
  brush.move({y1: 15, y2: 18});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushBrutalist() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush(penguins, {
    x: "culmen_length_mm",
    y: "culmen_depth_mm",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3
  });
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(penguins, brush.inactive({symbol: "species", r: 2})),
      Plot.dot(penguins, brush.context({symbol: "species", r: 2, strokeOpacity: 0.2})),
      Plot.dot(penguins, brush.focus({symbol: "species", r: 3}))
    ]
  });
  brush.move({x1: 36, x2: 48, y1: 15, y2: 20});
  return plot;
}

export async function brushCoordinates() {
  const random = d3.randomNormal.source(d3.randomLcg(42))();
  const data = Array.from({length: 200}, () => [random(), random()]);
  const brush = Plot.brush(data);
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(data, brush.inactive({fillOpacity: 0.5})),
      Plot.dot(data, brush.context({fill: "#ccc", fillOpacity: 0.5})),
      Plot.dot(data, brush.focus({fill: "red", fillOpacity: 0.5}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    textarea.value = formatValue(v);
  };
  plot.oninput = oninput;
  brush.move({x1: -1, x2: 1, y1: -1, y2: 0.5});
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

export async function brushDotTip() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = Plot.brush();
  const xy = {x: "culmen_length_mm" as const, y: "culmen_depth_mm" as const};
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.dot(penguins, brush.inactive({...xy, fill: "species", r: 2})),
      Plot.dot(penguins, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, brush.focus({...xy, fill: "species", r: 3, tip: true}))
    ]
  });
  brush.move({x1: 36, x2: 48, y1: 15, y2: 20});
  return plot;
}

export async function brushXLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const brush = Plot.brushX();
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.lineY(aapl, brush.inactive({x: "Date", y: "Close"})),
      Plot.lineY(aapl, brush.context({x: "Date", y: "Close", stroke: "#ccc", strokeWidth: 0.5})),
      Plot.lineY(aapl, brush.focus({x: "Date", y: "Close", strokeWidth: 2}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    if (!v?.filter) {
      textarea.value = formatValue(v);
    } else {
      const filtered = aapl.filter((d: any) => v.filter(d.Date));
      textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${aapl.length}`;
    }
  };
  plot.oninput = oninput;
  brush.move({x1: new Date("2015-01-01"), x2: new Date("2016-06-01")});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushLineZ() {
  const data = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  const brush = Plot.brush();
  const zxy = {z: "division", x: "date", y: "unemployment"} as const;
  const render = (index: number[], scales: any, values: any, dimensions: any, context: any, next: any) => {
    const Z = values.channels.z?.value;
    if (!Z) return next(index, scales, values, dimensions, context);
    const groups = new Set<any>();
    for (const i of index) groups.add(Z[i]);
    const expanded: number[] = [];
    for (let i = 0; i < Z.length; ++i) {
      if (groups.has(Z[i])) {
        expanded.push(i);
        values.z[i] = Z[i];
      }
    }
    return next(expanded, scales, values, dimensions, context);
  };
  const plot = Plot.plot({
    marks: [
      Plot.lineY(data, {...zxy, stroke: "#ccc", strokeWidth: 0.5}),
      brush,
      Plot.lineY(data, brush.focus({...zxy, strokeWidth: 2, render}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    if (!v?.filter) {
      textarea.value = formatValue(v);
    } else {
      const groups = new Set(data.filter((d: any) => v.filter(d.date, d.unemployment)).map((d: any) => d.division));
      const filtered = data.filter((d: any) => groups.has(d.division));
      textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${data.length}`;
    }
  };
  plot.oninput = oninput;
  brush.move({x1: new Date("2007-04-01"), x2: new Date("2007-09-30"), y1: 6.18, y2: 7.1});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function brushYLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const brush = Plot.brushY();
  const plot = Plot.plot({
    marks: [
      brush,
      Plot.lineX(aapl, brush.inactive({y: "Date", x: "Close"})),
      Plot.lineX(aapl, brush.context({y: "Date", x: "Close", stroke: "#ccc", strokeWidth: 0.5})),
      Plot.lineX(aapl, brush.focus({y: "Date", x: "Close", strokeWidth: 2}))
    ]
  });
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    const v = plot.value;
    if (!v?.filter) {
      textarea.value = formatValue(v);
    } else {
      const filtered = aapl.filter((d: any) => v.filter(d.Date));
      textarea.value = formatValue(v) + `\nfiltered: ${filtered.length} of ${aapl.length}`;
    }
  };
  plot.oninput = oninput;
  brush.move({y1: new Date("2015-01-01"), y2: new Date("2016-06-01")});
  oninput();
  return html`<figure>${plot}${textarea}</figure>`;
}
