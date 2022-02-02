import {create, select, dispatch as dispatcher, line, pointer, polygonContains, curveNatural} from "d3";
import {maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection, selectionEquals} from "../selection.js";
import {applyIndirectStyles} from "../style.js";

const defaults = {
  ariaLabel: "lasso",
  fill: "#777",
  fillOpacity: 0.3,
  stroke: "#666",
  strokeWidth: 2
};

export class Lasso extends Mark {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"}
      ],
      options,
      defaults
    );
    this.activeElement = null;
  }

  // The lasso polygons follow the even-odd rule in css, matching the way
  // they are computed by polygonContains.
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const margin = 5;
    const {ariaLabel, ariaDescription, ariaHidden, fill, fillOpacity, stroke, strokeWidth} = this;
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;

    const path = line().curve(curveNatural);
    const g = create("svg:g")
        .call(applyIndirectStyles, {ariaLabel, ariaDescription, ariaHidden, fill, fillOpacity, stroke, strokeWidth});
    g.append("rect")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", "none")
        .attr("cursor", "cross") // TODO
        .attr("pointer-events", "all")
        .attr("fill-rule", "evenodd");

    g.call(lassoer()
        .extent([[marginLeft - margin, marginTop - margin], [width - marginRight + margin, height - marginBottom + margin]])
        .on("start lasso end cancel", (polygons) => {
          g.selectAll("path")
            .data(polygons)
            .join("path")
            .attr("d", path);
          let S = null;
          let activePolygons = polygons.filter(polygon => polygon.length > 2);
          if (activePolygons.length > 0) {
            let bw;
            if (x.bandwidth && (bw = x.bandwidth() / 2)) activePolygons = activePolygons.map(polygon => polygon.map(p => [p[0] - bw, p[1]]));
            if (y.bandwidth && (bw = y.bandwidth() / 2)) activePolygons = activePolygons.map(polygon => polygon.map(p => [p[0], p[1] - bw]));
            S = index.filter(i => activePolygons.some(polygon => polygonContains(polygon, [X[i], Y[i]])));

          }
          if (!selectionEquals(node[selection], S)) {
            node[selection] = S;
            node.dispatchEvent(new Event("input", {bubbles: true}));
          }
        }));
    const node = g.node();
    node[selection] = null;
    return node;
  }
}

export function lasso(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Lasso(data, {...options, x, y});
}

// set up listeners that will follow this gesture all along
// (even outside the target canvas)
// TODO: in a supporting file
function trackPointer(e, { start, move, out, end }) {
  const tracker = {},
    id = (tracker.id = e.pointerId),
    target = e.target;
  tracker.point = pointer(e, target);
  target.setPointerCapture(id);

  select(target)
    .on(`pointerup.${id} pointercancel.${id}`, e => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      select(target).on(`.${id}`, null);
      target.releasePointerCapture(id);
      end && end(tracker);
    })
    .on(`pointermove.${id}`, e => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.prev = tracker.point;
      tracker.point = pointer(e, target);
      move && move(tracker);
    })
    .on(`pointerout.${id}`, e => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.point = null;
      out && out(tracker);
    });

  start && start(tracker);
}

function lassoer() {
  const polygons = [];
  const dispatch = dispatcher("start", "lasso", "end", "cancel");
  let extent;
  const lasso = selection => {
    const node = selection.node();
    let currentPolygon;

    selection
      .on("touchmove", e => e.preventDefault()) // prevent scrolling
      .on("pointerdown", e => {
        const p = pointer(e, node);
        for (let i = polygons.length - 1; i >= 0; --i) {
          if (polygonContains(polygons[i], p)) {
            polygons.splice(i, 1);
            dispatch.call("cancel", node, polygons);
            return;
          }
        }
        trackPointer(e, {
          start: p => {
            currentPolygon = [constrainExtent(p.point)];
            polygons.push(currentPolygon);
            dispatch.call("start", node, polygons);
          },
          move: p => {
            currentPolygon.push(constrainExtent(p.point));
            dispatch.call("lasso", node, polygons);
          },
          end: () => {
            dispatch.call("end", node, polygons);
          }
        });
      });
  };
  lasso.on = function(type, _) {
    return _ ? (dispatch.on(...arguments), lasso) : dispatch.on(...arguments);
  };
  lasso.extent = function(_) {
    return _ ? (extent = _, lasso) : extent;
  };

  function constrainExtent(p) {
    if (!extent) return p;
    return [clamp(p[0], extent[0][0], extent[1][0]), clamp(p[1], extent[0][1], extent[1][1])];
  }

  function clamp(x, a, b) {
    return x < a ? a : x > b ? b : x;
  }

  return lasso;
}