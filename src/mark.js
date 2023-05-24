import {channelDomain, createChannels, valueObject} from "./channel.js";
import {defined} from "./defined.js";
import {maybeFacetAnchor} from "./facet.js";
import {maybeKeyword, maybeNamed, maybeValue} from "./options.js";
import {arrayify, isDomainSort, isOptions, keyword, range, singleton} from "./options.js";
import {project} from "./projection.js";
import {maybeClip, styles} from "./style.js";
import {basic, initializer} from "./transforms/basic.js";

export class Mark {
  constructor(data, channels = {}, options = {}, defaults) {
    const {
      facet = "auto",
      facetAnchor,
      fx,
      fy,
      sort,
      dx = 0,
      dy = 0,
      margin = 0,
      marginTop = margin,
      marginRight = margin,
      marginBottom = margin,
      marginLeft = margin,
      clip,
      channels: extraChannels,
      tip,
      render
    } = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    if (facet === null || facet === false) {
      this.facet = null;
    } else {
      this.facet = keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude", "super"]);
      this.fx = data === singleton && typeof fx === "string" ? [fx] : fx;
      this.fy = data === singleton && typeof fy === "string" ? [fy] : fy;
    }
    this.facetAnchor = maybeFacetAnchor(facetAnchor);
    channels = maybeNamed(channels);
    if (extraChannels !== undefined) channels = {...maybeChannels(extraChannels), ...channels};
    if (defaults !== undefined) channels = {...styles(this, options, defaults), ...channels};
    this.channels = Object.fromEntries(
      Object.entries(channels)
        .map(([name, channel]) => {
          if (isOptions(channel.value)) {
            // apply scale overrides
            const {value, scale = channel.scale} = channel.value;
            channel = {...channel, scale, value};
          }
          if (data === singleton && typeof channel.value === "string") {
            // convert field names to singleton values for decoration marks (e.g., frame)
            const {value} = channel;
            channel = {...channel, value: [value]};
          }
          return [name, channel];
        })
        .filter(([name, {value, optional}]) => {
          if (value != null) return true;
          if (optional) return false;
          throw new Error(`missing channel value: ${name}`);
        })
    );
    this.dx = +dx;
    this.dy = +dy;
    this.marginTop = +marginTop;
    this.marginRight = +marginRight;
    this.marginBottom = +marginBottom;
    this.marginLeft = +marginLeft;
    this.clip = maybeClip(clip);
    this.tip = maybeTip(tip);
    // Super-faceting currently disallow position channels; in the future, we
    // could allow position to be specified in fx and fy in addition to (or
    // instead of) x and y.
    if (this.facet === "super") {
      if (fx || fy) throw new Error(`super-faceting cannot use fx or fy`);
      for (const name in this.channels) {
        const {scale} = channels[name];
        if (scale !== "x" && scale !== "y") continue;
        throw new Error(`super-faceting cannot use x or y`);
      }
    }
    if (render != null) {
      this.render = composeRender(render, this.render);
    }
  }
  initialize(facets, facetChannels, plotOptions) {
    let data = arrayify(this.data);
    if (facets === undefined && data != null) facets = [range(data)];
    const originalFacets = facets;
    if (this.transform != null) ({facets, data} = this.transform(data, facets, plotOptions)), (data = arrayify(data));
    if (facets !== undefined) facets.original = originalFacets; // needed to read facetChannels
    const channels = createChannels(this.channels, data);
    if (this.sort != null) channelDomain(data, facets, channels, facetChannels, this.sort); // mutates facetChannels!
    return {data, facets, channels};
  }
  filter(index, channels, values) {
    for (const name in channels) {
      const {filter = defined} = channels[name];
      if (filter !== null) {
        const value = values[name];
        index = index.filter((i) => filter(value[i]));
      }
    }
    return index;
  }
  // If there is a projection, and there are paired x and y channels associated
  // with the x and y scale respectively (and not already in screen coordinates
  // as with an initializer), then apply the projection, replacing the x and y
  // values. Note that the x and y scales themselves don’t exist if there is a
  // projection, but whether the channels are associated with scales still
  // determines whether the projection should apply; think of the projection as
  // a combination xy-scale.
  project(channels, values, context) {
    for (const cx in channels) {
      if (channels[cx].scale === "x" && /^x|x$/.test(cx)) {
        const cy = cx.replace(/^x|x$/, "y");
        if (cy in channels && channels[cy].scale === "y") {
          project(cx, cy, values, context.projection);
        }
      }
    }
  }
  scale(channels, scales, context) {
    const values = valueObject(channels, scales);
    if (context.projection) this.project(channels, values, context);
    return values;
  }
}

export function marks(...marks) {
  marks.plot = Mark.prototype.plot; // Note: depends on side-effect in plot!
  return marks;
}

export function composeRender(r1, r2) {
  if (r1 == null) return r2 === null ? undefined : r2;
  if (r2 == null) return r1 === null ? undefined : r1;
  if (typeof r1 !== "function") throw new TypeError(`invalid render transform: ${r1}`);
  if (typeof r2 !== "function") throw new TypeError(`invalid render transform: ${r2}`);
  return function (i, s, v, d, c, next) {
    return r1.call(this, i, s, v, d, c, (i, s, v, d, c) => {
      return r2.call(this, i, s, v, d, c, next); // preserve this
    });
  };
}

function maybeChannels(channels) {
  return Object.fromEntries(
    Object.entries(maybeNamed(channels)).map(([name, channel]) => {
      channel = maybeValue(channel);
      if (channel.filter === undefined && channel.scale == null) channel = {...channel, filter: null};
      return [name, channel];
    })
  );
}

function maybeTip(tip) {
  return tip === true ? "xy" : tip === false ? null : maybeKeyword(tip, "tip", ["x", "y", "xy"]);
}

export function withTip(options, tip) {
  return options?.tip === true ? {...options, tip} : options;
}
