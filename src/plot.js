import {bisectLeft, cross, difference, easeQuadInOut, extent, group, groups, InternMap, interpolate, interpolateNumber, interpolateRound, interpolateHsl, intersection, scaleLinear, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, Channels, channelDomain, valueObject} from "./channel.js";
import {Context, create} from "./context.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, constant, isDomainSort, isScaleOptions, keyword, map, maybeNamed, range, second, valueof, where, yes} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, coerceNumbers, exposeScales, isOrdinalScale} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {maybeTimeFilter, maybeTween, defaultKeys} from "./time.js";
import {basic, initializer} from "./transforms/basic.js";
import {maybeInterval} from "./transforms/interval.js";
import {consumeWarnings} from "./warnings.js";

export function plot(options = {}) {
  const {facet, time, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : options.marks.flat(Infinity).map(markify);

  // A Map from Mark instance to its render state, including:
  // index - the data index e.g. [0, 1, 2, 3, …]
  // channels - an array of materialized channels e.g. [["x", {value}], …]
  // faceted - a boolean indicating whether this mark is faceted
  // values - an object of scaled values e.g. {x: [40, 32, …], …}
  const stateByMark = new Map();

  // A Map from scale name to an array of associated channels.
  const channelsByScale = new Map();

  // If a scale is explicitly declared in options, initialize its associated
  // channels to the empty array; this will guarantee that a corresponding scale
  // will be created later (even if there are no other channels). But ignore
  // facet scale declarations if faceting is not enabled.
  for (const key of scaleRegistry.keys()) {
    if (isScaleOptions(options[key]) && key !== "fx" && key !== "fy") {
      channelsByScale.set(key, []);
    }
  }

  // Faceting!
  let facets; // array of facet definitions (e.g. [["foo", [0, 1, 3, …]], …])
  let facetIndex; // index over the facet data, e.g. [0, 1, 2, 3, …]
  let facetChannels; // e.g. {fx: {value}, fy: {value}}
  let facetsIndex; // nested array of facet indexes [[0, 1, 3, …], [2, 5, …], …]
  let facetsExclude; // lazily-constructed opposite of facetsIndex
  if (facet !== undefined) {
    const {x, y} = facet;
    if (x != null || y != null) {
      const facetData = arrayify(facet.data);
      if (facetData == null) throw new Error("missing facet data");
      facetChannels = {};
      if (x != null) {
        const fx = Channel(facetData, {value: x, scale: "fx"});
        facetChannels.fx = fx;
        channelsByScale.set("fx", [fx]);
      }
      if (y != null) {
        const fy = Channel(facetData, {value: y, scale: "fy"});
        facetChannels.fy = fy;
        channelsByScale.set("fy", [fy]);
      }
      facetIndex = range(facetData);
      facets = facetGroups(facetIndex, facetChannels);
      facetsIndex = facets.map(second);
    }
  }

  // Initialize the marks’ state.
  const markTimes = new Map();
  for (const mark of marks) {
    if (stateByMark.has(mark)) throw new Error("duplicate mark; each mark must be unique");

    let markFacets = facetsIndex === undefined ? undefined
      : mark.facet === "auto" ? mark.data === facet.data ? facetsIndex : undefined
      : mark.facet === "include" ? facetsIndex
      : mark.facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(facetIndex, f))))
      : undefined;

    const {data, facets, channels, time, timeFacets} = mark.initialize(markFacets, facetChannels);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});
    if (timeFacets.length) markTimes.set(mark, {time, timeFacets});
  }

  // Initalize the scales and axes.
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);
  const context = Context(options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(scaleDescriptors, axes);

  const {fx, fy} = scales;
  const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
  const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
  const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};

  // Reinitialize; for deriving channels dependent on other channels.
  const newByScale = new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const {facets, channels} = mark.initializer(state.data, state.facets, state.channels, scales, subdimensions);
      if (facets !== undefined) state.facets = facets;
      if (channels !== undefined) {
        inferChannelScale(channels, mark);
        applyScaleTransforms(channels, options);
        Object.assign(state.channels, channels);
        for (const {scale} of Object.values(channels)) if (scale != null) newByScale.add(scale);
      }
    }
  }

  // Reconstruct scales if new scaled channels were created during reinitialization.
  if (newByScale.size) {
    for (const key of newByScale) if (scaleRegistry.get(key) === position) throw new Error(`initializers cannot declare position scales: ${key}`);
    const newScaleDescriptors = Scales(addScaleChannels(new Map(), stateByMark, key => newByScale.has(key)), options);
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  autoScaleLabels(channelsByScale, scaleDescriptors, axes, dimensions, options);

  // Compute value objects, applying scales as needed.
  for (const state of stateByMark.values()) {
    state.values = valueObject(state.channels, scales);
  }

  // Infer the time scale
  let interpolateTime;
  let timeScale;
  if (markTimes.size) {
    ({time: timeScale} = Scales(new Map([["time", Array.from(markTimes, ([, {time}]) => ({value: time}))]]), options));
    if (isOrdinalScale(timeScale)) {
      const index = new InternMap(timeScale.domain.map((d, i) => [d, i]));
      // ordinal times are mapped to their rank in the ordinal domain
      for (const [, m] of markTimes) {
        const domain = [...intersection(timeScale.domain, m.time)];
        m.time = m.time.map(d => index.get(d));
        m.domain = domain.map(d => index.get(d));
      }
    } else {
      for (const [, m] of markTimes) {
        m.time = coerceNumbers(m.time);
        m.domain = [];
        for (const t of m.time) {
          if (isNaN(t) || !isFinite(t)) continue;
          const i = bisectLeft(m.domain, t);
          if (m.domain[i] === t) continue;
          m.domain.splice(i, 0, t);
        }
      }
    }

    const {
      delay = 0,
      duration = 5000,
      direction = 1,
      playbackRate = 1,
      initial,
      autoplay = true,
      iterations = 0,
      loop = !!iterations,
      alternate = false,
      loopDelay = 1000
    } = time == null ? {} : time;
    interpolateTime = scaleLinear()
      .domain(isOrdinalScale(timeScale) ? [0, timeScale.domain.length - 1] : extent(timeScale.domain))
      .range([0, 1]);

    if (typeof delay !== "number" || delay < 0 || !isFinite(delay)) throw new Error(`Unsupported delay ${delay}.`);
    if (typeof duration !== "number" || duration < 0 || !isFinite(duration)) throw new Error(`Unsupported duration ${duration}.`);
    if (![-1, 1, null].includes(direction)) throw new Error(`Unsupported direction ${direction}.`);
    if (initial != null && Number.isNaN(interpolateTime(initial))) throw new Error(`Unsupported initial time ${initial}.`);
    if (typeof autoplay !== "boolean") throw new Error(`Unsupported autoplay option ${autoplay}.`);
    if (typeof loop !== "boolean") throw new Error(`Unsupported loop option ${loop}.`);
    if (typeof playbackRate !== "number") throw new Error(`Unsupported playback rate ${playbackRate}.`);
    if (typeof alternate !== "boolean") throw new Error(`Unsupported alternate option ${alternate}.`);
    if (typeof loopDelay !== "number" || loopDelay < 0) throw new Error(`Unsupported loop delay ${loopDelay}.`);
    scaleDescriptors.time = {
      type: timeScale.type,
      domain: timeScale.domain,
      delay,
      duration,
      direction,
      playbackRate,
      initial,
      autoplay,
      iterations,
      loop,
      alternate,
      loopDelay,
      scale: timeScale.scale
    };
  }
  
  for (const [mark, state] of stateByMark) {
    const {facets, values} = state;

    // Reassemble time facets
    if (mark.time) {
      const m = markTimes.get(mark);
      const {domain, time, timeFacets} = m;
      if (domain.length <= 1) continue;

      const newTime = [];
      const newFacets = [];
      for (let k = 0; k < facets.length; ++k) {
        const t = time[k], j = timeFacets[k];
        for (const i of facets[k]) newTime[i] = t;
        newFacets[j] = newFacets[j] ? newFacets[j].concat(facets[k]) : facets[k];
      }

      state.facets = newFacets;
      state.interp = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Array.from(value)]));
      state.interp.time = newTime;
      state.opacity = new Array(newTime.length).fill(1);
    }
  }

  const animateMarks = [];

  const {width, height} = dimensions;

  const svg = create("svg", context)
      .attr("class", className)
      .attr("fill", "currentColor")
      .attr("font-family", "system-ui, sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-label", ariaLabel)
      .attr("aria-description", ariaDescription)
      .call(svg => svg.append("style").text(`
        .${className} {
          display: block;
          background: white;
          height: auto;
          height: intrinsic;
          max-width: 100%;
        }
        .${className} text,
        .${className} tspan {
          white-space: pre;
        }
      `))
      .call(applyInlineStyles, style)
    .node();

  // When faceting, render axes for fx and fy instead of x and y.
  const axisY = axes[facets !== undefined && fy ? "fy" : "y"];
  const axisX = axes[facets !== undefined && fx ? "fx" : "x"];
  if (axisY) svg.appendChild(axisY.render(null, scales, dimensions, context));
  if (axisX) svg.appendChild(axisX.render(null, scales, dimensions, context));

  // Render (possibly faceted) marks.
  if (facets !== undefined) {
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const indexByFacet = facetMap(facetChannels);
    facets.forEach(([key], i) => indexByFacet.set(key, i));
    const selection = select(svg);
    if (fy && axes.y) {
      const axis1 = axes.y, axis2 = nolabel(axis1);
      const j = axis1.labelAnchor === "bottom" ? fyDomain.length - 1 : axis1.labelAnchor === "center" ? fyDomain.length >> 1 : 0;
      selection.selectAll()
        .data(fyDomain)
        .enter()
        .append((ky, i) => (i === j ? axis1 : axis2).render(
          fx && where(fxDomain, kx => indexByFacet.has([kx, ky])),
          scales,
          {...dimensions, ...fyMargins, offsetTop: fy(ky)},
          context
        ));
    }
    if (fx && axes.x) {
      const axis1 = axes.x, axis2 = nolabel(axis1);
      const j = axis1.labelAnchor === "right" ? fxDomain.length - 1 : axis1.labelAnchor === "center" ? fxDomain.length >> 1 : 0;
      const {marginLeft, marginRight} = dimensions;
      selection.selectAll()
        .data(fxDomain)
        .enter()
        .append((kx, i) => (i === j ? axis1 : axis2).render(
          fy && where(fyDomain, ky => indexByFacet.has([kx, ky])),
          scales,
          {...dimensions, ...fxMargins, labelMarginLeft: marginLeft, labelMarginRight: marginRight, offsetLeft: fx(kx)},
          context
        ));
    }
    selection.selectAll()
      .data(facetKeys(scales).filter(indexByFacet.has, indexByFacet))
      .enter()
      .append("g")
        .attr("aria-label", "facet")
        .attr("transform", facetTranslate(fx, fy))
        .each(function(key) {
          const j = indexByFacet.get(key);
          for (const [mark, {channels, values, facets}] of stateByMark) {
            const facet = facets ? mark.filter(facets[j] ?? facets[0], channels, values) : null;
            const index = mark.time ? [] : facet;
            const node = mark.render(index, scales, values, subdimensions, context);
            if (node != null) {
              this.appendChild(node);
              if (mark.time) {
                animateMarks.push({
                  mark,
                  node,
                  facet,
                  dimensions: subdimensions
                });
              }
            }
          }
        });
  } else {
    for (const [mark, {channels, values, facets}] of stateByMark) {
      const facet = facets ? mark.filter(facets[0], channels, values) : null;
      const index = mark.time ? [] : facet;
      const node = mark.render(index, scales, values, dimensions, context);
      if (node != null) {
        svg.appendChild(node);
        if (mark.time) {
          animateMarks.push({
            mark,
            node,
            facet,
            dimensions
          });
        }
      }
    }
  }

  // Wrap the plot in a figure with a caption, if desired.
  let figure = svg;
  const legends = Legends(scaleDescriptors, context, options);
  if (caption != null || legends.length > 0) {
    const {document} = context;
    figure = document.createElement("figure");
    figure.style.maxWidth = "initial";
    for (const legend of legends) figure.appendChild(legend);
    figure.appendChild(svg);
    if (caption != null) {
      const figcaption = document.createElement("figcaption");
      figcaption.appendChild(caption instanceof Node ? caption : document.createTextNode(caption));
      figure.appendChild(figcaption);
    }
  }

  figure.scale = exposeScales(scaleDescriptors);
  figure.legend = exposeLegends(scaleDescriptors, context, options);

  const w = consumeWarnings();
  if (w > 0) {
    select(svg).append("text")
        .attr("x", width)
        .attr("y", 20)
        .attr("dy", "-1em")
        .attr("text-anchor", "end")
        .attr("font-family", "initial") // fix emoji rendering in Chrome
        .text("\u26a0\ufe0f") // emoji variation selector
      .append("title")
        .text(`${w.toLocaleString("en-US")} warning${w === 1 ? "" : "s"}. Please check the console.`);
  }

  if (animateMarks.length > 0) {
    const {alternate, autoplay, delay, direction, duration, initial, iterations, loopDelay} = scaleDescriptors.time;
    let {loop, playbackRate} = scaleDescriptors.time;
    let lastTick;
    let t1, currentTime, ended = false, paused = !autoplay;

    const timeupdate = (t) => {
      if (t1 === (t = Math.max(0, Math.min(1, t)))) return;
      currentTime = interpolateTime.invert(t1 = t);
      for (const timeMark of animateMarks) {
        const {mark, facet, dimensions} = timeMark;
        const {channels: {key}} = stateByMark.get(mark);
        const {domain} = markTimes.get(mark);
        const K = key ? key.value : null;
        const i0 = bisectLeft(domain, currentTime);
        const time0 = domain[i0 - 1];
        const time1 = domain[i0] !== undefined ? domain[i0] : time0;
        const timet = time1 === time0 ? 0 : (t - interpolateTime(time0)) / (interpolateTime(time1) - interpolateTime(time0));
        const {interp, opacity} = stateByMark.get(mark);
        const T = interp.time;
        let timeNode;
        const I0 = facet.filter(i => T[i] === time0); // preceding keyframe
        const I1 = facet.filter(i => T[i] === time1); // following keyframe
        let enter = [], update = [], target = [], exit = [];
        if (K) {
          const K0 = new Set(I0.map(i => K[i]));
          const K1 = new Set(I1.map(i => K[i]));
          const Kenter = difference(K1, K0);
          const Kupdate = intersection(K0, K1);
          const Kexit = difference(K0, K1);
          enter = I1.filter(i => Kenter.has(K[i]));
          update = I0.filter(i => Kupdate.has(K[i]));
          target = update.map(i => I1.find(j => K[i] === K[j])); // TODO: use an index
          exit = I0.filter(i => Kexit.has(K[i]));
        } else {
          enter = I1;
          exit = I0;
        }
        const n = update.length;
        const nt = n + enter.length + exit.length;
        const Ii = Uint32Array.from({length: nt}).map((_, i) => i + T.length);
        if (exit.length || enter.length) interp.opacity = opacity;

        // TODO This is interpolating the already-scaled values, but we
        // probably want to interpolate in data space instead and then
        // re-apply the scales. I’m not sure what to do for ordinal data,
        // but interpolating in data space will ensure that the resulting
        // instantaneous visualization is meaningful and valid. TODO If the
        // data is sparse (not all series have values for all times), then
        // we will need a separate key channel to align the start and end
        // values for interpolation; this code currently assumes that the
        // data is complete.
        for (const k in interp) {
          if (k === "time") {
            for (let i = 0; i < nt; ++i) interp[k][Ii[i]] = currentTime;
          } else if (k === "opacity") {
            const _exit = easeQuadInOut(1 - timet);
            const _enter = easeQuadInOut(timet);
            for (let i = 0; i < exit.length; ++i) interp[k][Ii[i]] = _exit;
            for (let i = 0; i < n; ++i) interp[k][Ii[exit.length + i]] = 1;
            for (let i = 0; i < enter.length; ++i) interp[k][Ii[exit.length + n + i]] = _enter;
          } else {
            const tween = maybeTween(mark.tween, k);
            const interpolator = tween ? tween :
              ["time"].includes(k) ? () => constant(currentTime) :
              ["x", "x1", "x2", "y", "y1", "y2", "r"].includes(k) ? interpolateNumber :
              ["fill", "stroke"].includes(k) ? interpolateHsl :
              ["text"].includes(k) ? (a, b) => typeof a === "number" ? (frac(a) || frac(b) || Math.abs(a-b) < 3) ? interpolateNumber(a, b) : interpolateRound(a, b) : constant(a) :
              interpolate;
            for (let i = 0; i < exit.length; ++i) interp[k][Ii[i]] = interp[k][exit[i]];
            for (let i = 0; i < n; ++i) {
              const prev = interp[k][update[i]], next = interp[k][target[i]];
              interp[k][Ii[i + exit.length]] = prev == next ? prev : interpolator(prev, next)(timet);
            }
            for (let i = 0; i < enter.length; ++i) interp[k][Ii[i + n + exit.length]] = interp[k][enter[i]];
          }
        }
        const ifacet = [...facet.filter(i => T[i] < time1), ...(currentTime < time1) ? Ii : [], ...facet.filter(i => T[i] >= time1)];
        const index = mark.timeFilter(ifacet, T, currentTime);
        timeNode = mark.render(index, scales, interp, dimensions, context);
        timeMark.node.replaceWith(timeMark.node = timeNode);        
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
      if (window.CustomEvent) figure.dispatchEvent(new window.CustomEvent("timeupdate"));
    };

    let ticker = direction * playbackRate < 0 ? 1 : 0;
    const tick = function() {
      if (paused) {
        lastTick = undefined;
      } else {
        // advance (or rewind) the clock by dt
        const dt = lastTick === undefined
          ? (lastTick = performance.now(), 0)
          : performance.now() - lastTick;
        lastTick += dt;
        ticker += dt * direction * playbackRate / duration;
      }

      // t is the projection of the clock to the looping interval
      let t = ticker;

      if (loop) {
        const s = 1 + loopDelay / duration;
        const t0 = Math.floor((0.5 + Math.abs(t - 0.5)) / s);
        if (iterations && t0 >= iterations) {
          t = 2; // ends
        } else {
          const f = t - s * t0 * Math.sign(t - 0.5);
          if (alternate) {
            t = t0 % 2 ? 1 - f : f;
          } else {
            t = f;
          }
          t = Math.max(0, Math.min(1, t));
        }
      }
      ended = t < 0 || t > 1;
      if (ended) paused = true;

      timeupdate(t);
      if (figure.parentElement) requestAnimationFrame(tick);
    };

    // When using setTime, the argument is in the original time domain
    const setTime = function(time) {
      if (isOrdinalScale(timeScale)) {
        const i = timeScale.domain.indexOf(time);
        if (i === -1) throw new Error(`unknown time ${time}`);
        time = i;
      }
      ticker = interpolateTime(time);
      currentTime = interpolateTime.invert(ticker);
      ended = ticker < 0 || ticker > 1;
      lastTick = t1 = undefined;
      timeupdate(Math.max(0, Math.min(1, ticker)));
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
    figure.play = () => {
      if (ended) {
        setTime(initial == null
          ? timeScale.domain[direction * playbackRate < 0 ? timeScale.domain.length - 1 : 0]
          : initial
        );
      }
      paused = false;
      return new Promise(r => r());
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause
    figure.pause = () => {
      paused = true;
      t1 = undefined;
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
    Object.defineProperty(figure, 'duration', {get: () => duration / 1000});
    
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/paused
    Object.defineProperty(figure, 'paused', {get: () => paused});

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended
    Object.defineProperty(figure, 'ended', {get: () => ended});

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
    Object.defineProperty(figure, 'currentTime', {
      get: () => isOrdinalScale(timeScale) ? timeScale.domain[Math.floor(currentTime)]
        : timeScale.type === "utc" || timeScale.type === "time" ? new Date(currentTime)
        : currentTime,
      set: setTime
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate
    // https://github.com/whatwg/html/issues/3754
    Object.defineProperty(figure, 'playbackRate', {get: () => playbackRate, set: (l) => {!isNaN(l = +l) && (playbackRate = l);}});

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loop
    Object.defineProperty(figure, 'loop', {get: () => loop, set: (l) => {loop = !!l;}});

    if (initial != null) setTime(initial);

    timeupdate(ticker);
    setTimeout(tick, delay);
  }

  return figure;
}

export class Mark {
  constructor(data, channels = {}, options = {}, defaults) {
    const {facet = "auto", sort, time, key, timeFilter, tween, dx, dy, clip, channels: extraChannels} = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    this.facet = facet == null || facet === false ? null : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
    this.timeFilter = maybeTimeFilter(timeFilter);
    this.tween = tween;
    channels = maybeNamed(channels);
    if (extraChannels !== undefined) channels = {...maybeNamed(extraChannels), ...channels};
    if (defaults !== undefined) channels = {...styles(this, options, defaults), ...channels};
    this.time = time;
    this.key = key;
    this.channels = Object.fromEntries(Object.entries(channels).filter(([name, {value, optional}]) => {
      if (value != null) return true;
      if (optional) return false;
      throw new Error(`missing channel value: ${name}`);
    }));
    this.dx = +dx || 0;
    this.dy = +dy || 0;
    this.clip = maybeClip(clip);
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    if (facets === undefined && data != null) facets = [range(data)];
    const T = valueof(data, this.time), time = [], timeFacets = [];
    if (T != null) {
      facets = facets.flatMap((facet, j) => Array.from(
        group(facet, i => T[i]),
        ([t, I]) => (timeFacets.push(j), time.push(t), I)
      ));
      this.channels.key = {value: this.key ?? defaultKeys(T), filter: null};
    }
    if (this.transform != null) {
      ({data, facets} = this.transform(data, facets)), data = arrayify(data);
    }
    const channels = Channels(this.channels, data);
    if (this.sort != null) channelDomain(channels, facetChannels, data, this.sort);
    return {data, facets, channels, time, timeFacets};
  }
  filter(index, channels, values) {
    for (const name in channels) {
      const {filter = defined} = channels[name];
      if (filter !== null) {
        const value = values[name];
        index = index.filter(i => filter(value[i]));
      }
    }
    return index;
  }
  plot({marks = [], ...options} = {}) {
    return plot({...options, marks: [...marks, this]});
  }
}

export function marks(...marks) {
  marks.plot = Mark.prototype.plot;
  return marks;
}

function markify(mark) {
  return typeof mark?.render === "function" ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    super();
    if (render == null) return;
    if (typeof render !== "function") throw new TypeError("invalid mark; missing render function");
    this.render = render;
  }
  render() {}
}

// Note: mutates channel.value to apply the scale transform, if any.
function applyScaleTransforms(channels, options) {
  for (const name in channels) {
    const channel = channels[name];
    const {scale} = channel;
    if (scale != null) {
      const {
        percent,
        interval,
        transform = percent ? x => x * 100 : maybeInterval(interval)?.floor
      } = options[scale] || {};
      if (transform != null) channel.value = map(channel.value, transform);
    }
  }
  return channels;
}

// An initializer may generate channels without knowing how the downstream mark
// will use them. Marks are typically responsible associated scales with
// channels, but here we assume common behavior across marks.
function inferChannelScale(channels) {
  for (const name in channels) {
    const channel = channels[name];
    let {scale} = channel;
    if (scale === true) {
      switch (name) {
        case "fill": case "stroke": scale = "color"; break;
        case "fillOpacity": case "strokeOpacity": case "opacity": scale = "opacity"; break;
        default: scale = scaleRegistry.has(name) ? name : null; break;
      }
      channel.scale = scale;
    }
  }
}

function addScaleChannels(channelsByScale, stateByMark, filter = yes) {
  for (const {channels} of stateByMark.values()) {
    for (const name in channels) {
      const channel = channels[name];
      const {scale} = channel;
      if (scale != null && filter(scale)) {
        const channels = channelsByScale.get(scale);
        if (channels !== undefined) channels.push(channel);
        else channelsByScale.set(scale, [channel]);
      }
    }
  }
  return channelsByScale;
}

// Derives a copy of the specified axis with the label disabled.
function nolabel(axis) {
  return axis === undefined || axis.label === undefined
    ? axis // use the existing axis if unlabeled
    : Object.assign(Object.create(axis), {label: undefined});
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain())
    : fx ? fx.domain()
    : fy.domain();
}

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array; see also facetMap.
function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy)
    : fx ? facetGroup1(index, fx)
    : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return groups(index, i => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return groups(index, i => FX[i], i => FY[i])
    .flatMap(([x, xgroup]) => xgroup
    .map(([y, ygroup]) => [[x, y], ygroup]));
}

// This must match the key structure returned by facetGroups.
function facetTranslate(fx, fy) {
  return fx && fy ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx ? kx => `translate(${fx(kx)},0)`
    : ky => `translate(0,${fy(ky)})`;
}

function facetMap({fx, fy}) {
  return new (fx && fy ? FacetMap2 : FacetMap);
}

class FacetMap {
  constructor() {
    this._ = new InternMap();
  }
  has(key) {
    return this._.has(key);
  }
  get(key) {
    return this._.get(key);
  }
  set(key, value) {
    return this._.set(key, value), this;
  }
}

// A Map-like interface that supports paired keys.
class FacetMap2 extends FacetMap {
  has([key1, key2]) {
    const map = super.get(key1);
    return map ? map.has(key2) : false;
  }
  get([key1, key2]) {
    const map = super.get(key1);
    return map && map.get(key2);
  }
  set([key1, key2], value) {
    const map = super.get(key1);
    if (map) map.set(key2, value);
    else super.set(key1, new InternMap([[key2, value]]));
    return this;
  }
}

function frac(x) {
  return x - Math.floor(x);
}
