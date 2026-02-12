import {brush as d3Brush, create, selectAll} from "d3";
import {Mark} from "../mark.js";

export class Brush extends Mark {
  constructor() {
    super(undefined, {}, {}, {});
    this._brush = d3Brush();
    this._brushNodes = [];
    this.inactive = renderFilter(true);
    this.context = renderFilter(false);
    this.focus = renderFilter(false);
  }
  render(index, scales, values, dimensions, context) {
    const {x, y, fx, fy} = scales;
    const {inactive, context: ctx, focus} = this;
    let target, currentNode, clearing;

    if (!index?.fi) {
      const invertX = (!context.projection && x?.invert) || ((d) => d);
      const invertY = (!context.projection && y?.invert) || ((d) => d);
      context.dispatchValue(null);
      const {_brush, _brushNodes} = this;
      _brush
        .extent([
          [dimensions.marginLeft - 1, dimensions.marginTop - 1],
          [dimensions.width - dimensions.marginRight + 1, dimensions.height - dimensions.marginBottom + 1]
        ])
        .on("start brush end", function (event) {
          const {selection, type} = event;
          if (type === "start" && !clearing) {
            target = event.sourceEvent?.currentTarget ?? this;
            currentNode = _brushNodes.indexOf(target);
            if (!clearing) {
              clearing = true;
              selectAll(_brushNodes.filter((_, i) => i !== currentNode)).call(_brush.move, null);
              clearing = false;
              for (let i = 0; i < _brushNodes.length; ++i) {
                inactive.update(false, i);
                ctx.update(true, i);
                focus.update(false, i);
              }
            }
          }

          if (selection === null) {
            if (type === "end") {
              for (let i = 0; i < _brushNodes.length; ++i) {
                inactive.update(true, i);
                ctx.update(false, i);
                focus.update(false, i);
              }
            } else {
              inactive.update(false, currentNode);
              ctx.update(true, currentNode);
              focus.update(false, currentNode);
            }
            context.dispatchValue(null);
          } else {
            let [[px1, py1], [px2, py2]] = selection;
            px1 -= 0.25;
            px2 += 0.25;
            py1 -= 0.25;
            py2 += 0.25;
            inactive.update(false, currentNode);
            ctx.update((xi, yi) => !(px1 < xi && xi < px2 && py1 < yi && yi < py2), currentNode);
            focus.update((xi, yi) => px1 < xi && xi < px2 && py1 < yi && yi < py2, currentNode);

            let x1 = invertX(px1),
              x2 = invertX(px2);
            let y1 = invertY(py1),
              y2 = invertY(py2);
            if (x1 > x2) [x2, x1] = [x1, x2];
            if (y1 > y2) [y2, y1] = [y1, y2];

            const facet = target?.__data__;
            const filter = filterFromBrush(x, y, facet, context.projection, px1, px2, py1, py2);
            context.dispatchValue({
              x1,
              x2,
              y1,
              y2,
              ...(fx && facet && {fx: facet.x}),
              ...(fy && facet && {fy: facet.y}),
              filter
            });
          }
        });
    }

    const g = create("svg:g").attr("aria-label", "brush");
    g.call(this._brush);
    const node = g.node();
    this._brushNodes.push(node);
    return node;
  }
}

export function brush() {
  return new Brush();
}

function filterFromBrush(xScale, yScale, facet, projection, px1, px2, py1, py2) {
  let px, py;
  const stream = projection?.stream({
    point(x, y) {
      px = x;
      py = y;
    }
  }) ?? {
    point: (x, y) => {
      px = xScale(x);
      py = yScale(y);
    }
  };
  return filterSignature(
    (dx, dy) => {
      stream.point(dx, dy);
      return px1 < px && px < px2 && py1 < py && py < py2;
    },
    facet?.x,
    facet?.y
  );
}

function filterSignature(test, currentFx, currentFy) {
  return currentFx === undefined
    ? currentFy === undefined
      ? (x, y) => test(x, y)
      : (x, y, fy) => fy === currentFy && test(x, y)
    : currentFy === undefined
    ? (x, y, fx) => fx === currentFx && test(x, y)
    : (x, y, fx, fy) => fx === currentFx && fy === currentFy && test(x, y);
}

function renderFilter(initialTest) {
  const updatePerFacet = [];
  return Object.assign(
    function (options = {}) {
      return {
        ...options,
        render(index, scales, values, dimensions, context, next) {
          const {x: X, y: Y} = values;
          const filter = (test) =>
            typeof test === "function" ? index.filter((i) => test(X[i], Y[i])) : test ? index : [];
          let g = next(filter(initialTest), scales, values, dimensions, context);
          updatePerFacet.push((test) => {
            const transform = g.getAttribute("transform");
            g.replaceWith((g = next(filter(test), scales, values, dimensions, context)));
            if (transform) g.setAttribute("transform", transform);
          });
          return g;
        }
      };
    },
    {
      update(test, i) {
        return updatePerFacet[i]?.(test);
      }
    }
  );
}
