import {
  bisectLeft,
  difference,
  easeQuadInOut,
  extent,
  InternMap,
  interpolate,
  interpolateHcl,
  interpolateHsl,
  interpolateNumber,
  interpolateRgb,
  interpolateRound,
  intersection,
  scaleLinear
} from "d3";
import {constant, isObject} from "./options.js";
import {isOrdinalScale, Scales, coerceNumbers} from "./scales.js";

export function maybeTimeFilter(filter = "eq") {
  if (typeof filter === "function") return timeFunction(filter);
  switch (`${filter}`.toLowerCase()) {
    case "lt":
      return timeLt;
    case "lte":
      return timeLte;
    case "gt":
      return timeGt;
    case "gte":
      return timeGte;
    case "eq":
      return timeEq;
  }
  throw new Error(`invalid time filter: ${filter}`);
}

function timeFunction(f) {
  return (I, T, time) => {
    return I.filter((i) => f(T[i], time));
  };
}

function timeLt(I, T, time) {
  return I.filter((i) => T[i] < time);
}

function timeLte(I, T, time) {
  return I.filter((i) => T[i] <= time);
}

function timeGt(I, T, time) {
  return I.filter((i) => T[i] > time);
}

function timeGte(I, T, time) {
  return I.filter((i) => T[i] >= time);
}

function timeEq(I, T, time) {
  return I.filter((i) => T[i] === time);
}

export function defaultKey(times) {
  const tkey = new InternMap();
  return times.map(
    (t) => (tkey.set(t, tkey.has(t) ? 1 + tkey.get(t) : 0), tkey.get(t))
  );
}

function maybeTween(tween, k) {
  const t = isObject(tween) ? tween[k] : tween;
  if (t == null) return;
  switch (t) {
    case "interpolateRound":
    case "round":
      return interpolateRound;
    case "number":
      return interpolateNumber;
    case "rgb":
      return interpolateRgb;
    case "hsl":
      return interpolateHsl;
    case "hcl":
      return interpolateHcl;
  }
  if (typeof t !== "function") throw new Error(`invalid tween: ${t}`);
  return t;
}

export function prepareTimeScale(options, stateByMark) {
  const { time } = Scales(
    new Map([
      ["time", Array.from(stateByMark, ([, { time }]) => ({ value: time }))]
    ]),
    options
  );
  if (isOrdinalScale(time)) {
    const index = new InternMap(time.domain.map((d, i) => [d, i]));
    // ordinal times are mapped to their rank in the ordinal domain
    for (const [, m] of stateByMark) {
      const domain = [...intersection(time.domain, m.time)];
      m.time = m.time.map((d) => index.get(d));
      m.domain = domain.map((d) => index.get(d));
    }
  } else {
    for (const [, m] of stateByMark) {
      if (m.time) {
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
  } = options.time != null ? options.time : {};
  const interpolateTime = scaleLinear()
    .domain(
      isOrdinalScale(time) ? [0, time.domain.length - 1] : extent(time.domain)
    )
    .range([0, 1]);
  if (typeof delay !== "number" || delay < 0 || !isFinite(delay))
    throw new Error(`Unsupported delay ${delay}.`);
  if (typeof duration !== "number" || duration < 0 || !isFinite(duration))
    throw new Error(`Unsupported duration ${duration}.`);
  if (![-1, 1, null].includes(direction))
    throw new Error(`Unsupported direction ${direction}.`);
  if (initial != null && Number.isNaN(interpolateTime(initial)))
    throw new Error(`Unsupported initial time ${initial}.`);
  if (typeof autoplay !== "boolean")
    throw new Error(`Unsupported autoplay option ${autoplay}.`);
  if (typeof loop !== "boolean")
    throw new Error(`Unsupported loop option ${loop}.`);
  if (typeof playbackRate !== "number")
    throw new Error(`Unsupported playback rate ${playbackRate}.`);
  if (typeof alternate !== "boolean")
    throw new Error(`Unsupported alternate option ${alternate}.`);
  if (typeof loopDelay !== "number" || loopDelay < 0)
    throw new Error(`Unsupported loop delay ${loopDelay}.`);
  return {
    ...time,
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
    interpolateTime
  };
}

export function animate(stateByMark, time, scales, figure, context) {
  const {
    alternate,
    autoplay,
    delay,
    direction,
    duration,
    initial,
    iterations,
    loopDelay,
    interpolateTime
  } = time;
  let { loop, playbackRate } = time,
    lastTick,
    t1,
    currentTime,
    ended = false,
    paused = !autoplay;

  const timeupdate = (t) => {
    if (t1 === (t = Math.max(0, Math.min(1, t)))) return;
    currentTime = interpolateTime.invert((t1 = t));
    for (const [mark, { layouts }] of stateByMark) {
      if (!layouts?.length) continue;
      for (const layout of layouts) {
        const { facet, dimensions } = layout;
        const {
          channels: { key }
        } = stateByMark.get(mark);
        const { domain } = stateByMark.get(mark);
        const K = key ? key.value : null;
        const i0 = bisectLeft(domain, currentTime);
        const time0 = domain[i0 - 1];
        const time1 = domain[i0] !== undefined ? domain[i0] : time0;
        const timet =
          time1 === time0
            ? 0
            : (t - interpolateTime(time0)) /
              (interpolateTime(time1) - interpolateTime(time0));
        const { interp, opacity } = stateByMark.get(mark);
        const T = interp.time;
        let timeNode;
        const I0 = facet.filter((i) => T[i] === time0); // preceding keyframe
        const I1 = facet.filter((i) => T[i] === time1); // following keyframe
        let enter = [],
          update = [],
          target = [],
          exit = [];
        if (K) {
          const K0 = new Set(I0.map((i) => K[i]));
          const K1 = new Set(I1.map((i) => K[i]));
          const Kenter = difference(K1, K0);
          const Kupdate = intersection(K0, K1);
          const Kexit = difference(K0, K1);
          enter = I1.filter((i) => Kenter.has(K[i]));
          update = I0.filter((i) => Kupdate.has(K[i]));
          target = update.map((i) => I1.find((j) => K[i] === K[j])); // TODO: use an index
          exit = I0.filter((i) => Kexit.has(K[i]));
        } else {
          enter = I1;
          exit = I0;
        }
        const n = update.length;
        const nt = n + enter.length + exit.length;
        const Ii = Uint32Array.from({ length: nt }).map((_, i) => i + T.length);
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
            for (let i = 0; i < enter.length; ++i)
              interp[k][Ii[exit.length + n + i]] = _enter;
          } else {
            const tween = maybeTween(mark.tween, k);
            const interpolator = tween
              ? tween
              : ["time"].includes(k)
              ? () => constant(currentTime)
              : ["x", "x1", "x2", "y", "y1", "y2", "r"].includes(k)
              ? interpolateNumber
              : ["fill", "stroke"].includes(k)
              ? interpolateHsl
              : ["text"].includes(k)
              ? (a, b) =>
                  typeof a === "number"
                    ? (a % 1) || (b % 1) || Math.abs(a - b) < 3
                      ? interpolateNumber(a, b)
                      : interpolateRound(a, b)
                    : constant(a)
              : interpolate;
            for (let i = 0; i < exit.length; ++i)
              interp[k][Ii[i]] = interp[k][exit[i]];
            for (let i = 0; i < n; ++i) {
              const prev = interp[k][update[i]],
                next = interp[k][target[i]];
              interp[k][Ii[i + exit.length]] =
                prev == next ? prev : interpolator(prev, next)(timet);
            }
            for (let i = 0; i < enter.length; ++i)
              interp[k][Ii[i + n + exit.length]] = interp[k][enter[i]];
          }
        }
        const ifacet = [
          ...facet.filter((i) => T[i] < time1),
          ...(currentTime < time1 ? Ii : []),
          ...facet.filter((i) => T[i] >= time1)
        ];
        const index = mark.timeFilter(ifacet, T, currentTime);
        timeNode = mark.render(index, scales, interp, dimensions, context);
        layout.node.replaceWith((layout.node = timeNode));
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
    if (window.CustomEvent)
      figure.dispatchEvent(new window.CustomEvent("timeupdate"));
  };

  let ticker = direction * playbackRate < 0 ? 1 : 0;
  const tick = function () {
    if (paused) {
      lastTick = undefined;
    } else {
      // advance (or rewind) the clock by dt
      const dt =
        lastTick === undefined
          ? ((lastTick = performance.now()), 0)
          : performance.now() - lastTick;
      lastTick += dt;
      ticker += (dt * direction * playbackRate) / duration;
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
        t = Math.max(0, Math.min(1, alternate && t0 % 2 ? 1 - f : f));
      }
    }
    ended = t < 0 || t > 1;
    if (ended) paused = true;

    timeupdate(t);
    if (figure.parentElement) requestAnimationFrame(tick);
  };

  // When using setTime, the argument is in the original time domain
  const setTime = function (t) {
    if (isOrdinalScale(time)) {
      const i = time.domain.indexOf(t);
      if (i === -1) throw new Error(`unknown time ${t}`);
      t = i;
    }
    ticker = interpolateTime(t);
    currentTime = interpolateTime.invert(ticker);
    ended = ticker < 0 || ticker > 1;
    lastTick = t1 = undefined;
    timeupdate(Math.max(0, Math.min(1, ticker)));
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
  figure.play = () => {
    if (ended) {
      setTime(
        initial == null
          ? time.domain[
              direction * playbackRate < 0 ? time.domain.length - 1 : 0
            ]
          : initial
      );
    }
    paused = false;
    return new Promise((r) => r());
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause
  figure.pause = () => {
    paused = true;
    t1 = undefined;
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
  Object.defineProperty(figure, "duration", { get: () => duration / 1000 });

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/paused
  Object.defineProperty(figure, "paused", { get: () => paused });

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended
  Object.defineProperty(figure, "ended", { get: () => ended });

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
  Object.defineProperty(figure, "currentTime", {
    get: () =>
      isOrdinalScale(time)
        ? time.domain[Math.floor(currentTime)]
        : time.type === "utc" || time.type === "time"
        ? new Date(currentTime)
        : currentTime,
    set: setTime
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate
  // https://github.com/whatwg/html/issues/3754
  Object.defineProperty(figure, "playbackRate", {
    get: () => playbackRate,
    set: (l) => {
      !isNaN((l = +l)) && (playbackRate = l);
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loop
  Object.defineProperty(figure, "loop", {
    get: () => loop,
    set: (l) => {
      loop = !!l;
    }
  });

  if (initial != null) setTime(initial);
  timeupdate(ticker);
  setTimeout(tick, delay);
}
