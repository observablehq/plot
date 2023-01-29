import {Channels, channelDomain, valueObject} from "./channel.js";
import {defined} from "./defined.js";
import {maybeFacetAnchor} from "./facet.js";
import {arrayify, isDomainSort, range} from "./options.js";
import {keyword, maybeNamed} from "./options.js";
import {maybeProject} from "./projection.js";
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
      channels: extraChannels
    } = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    channels = maybeNamed(channels);
    if (extraChannels !== undefined) channels = {...maybeNamed(extraChannels), ...channels};
    if (defaults !== undefined) channels = {...styles(this, options, defaults), ...channels};
    if (facet === null || facet === false) this.facet = null;
    else if (isSuper(facet)) {
      // Super-faceted marks currently disallow position channels; in the
      // future, we could allow position to be specified in fx and fy in
      // addition to (or instead of) x and y.
      this.facet = "super";
      if (fx || fy) throw new Error(`super-faceted marks cannot use fx or fy`);
      for (const name in channels) {
        const {scale, value} = channels[name];
        if (value == null || (scale !== "x" && scale !== "y")) continue;
        throw new Error(`super-faceted marks cannot use x or y`);
      }
    } else {
      this.facet = keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
      this.fx = fx;
      this.fy = fy;
    }
    this.facetAnchor = maybeFacetAnchor(facetAnchor);
    this.dx = +dx;
    this.dy = +dy;
    this.marginTop = +marginTop;
    this.marginRight = +marginRight;
    this.marginBottom = +marginBottom;
    this.marginLeft = +marginLeft;
    this.clip = maybeClip(clip);
    this.channels = Object.fromEntries(
      Object.entries(channels).filter(([name, {value, optional}]) => {
        if (value != null) return true;
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      })
    );
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    if (facets === undefined && data != null) facets = [range(data)];
    if (this.transform != null) ({facets, data} = this.transform(data, facets)), (data = arrayify(data));
    const channels = Channels(this.channels, data);
    if (this.sort != null) channelDomain(channels, facetChannels, data, this.sort); // mutates facetChannels!
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
  // If there is a projection, and there are both x and y channels (or x1 and
  // y1, or x2 and y2 channels), and those channels are associated with the x
  // and y scale respectively (and not already in screen coordinates as with an
  // initializer), then apply the projection, replacing the x and y values. Note
  // that the x and y scales themselves don’t exist if there is a projection,
  // but whether the channels are associated with scales still determines
  // whether the projection should apply; think of the projection as a
  // combination xy-scale.
  project(channels, values, context) {
    maybeProject("x", "y", channels, values, context);
    maybeProject("x1", "y1", channels, values, context);
    maybeProject("x2", "y2", channels, values, context);
  }
  scale(channels, scales, context) {
    const values = valueObject(channels, scales);
    if (context.projection) this.project(channels, values, context);
    return values;
  }
}

function isSuper(value) {
  return /^\s*super\s*$/i.test(value);
}
