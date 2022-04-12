import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const plotsrc = `
src/channel.js
src/scales.js
src/warnings.js
src/format.js
src/marks/line.js
src/marks/cell.js
src/marks/rect.js
src/marks/arrow.js
src/marks/box.js
src/marks/tree.js
src/marks/link.js
src/marks/vector.js
src/marks/dot.js
src/marks/image.js
src/marks/area.js
src/marks/rule.js
src/marks/marker.js
src/marks/bar.js
src/marks/tick.js
src/marks/text.js
src/marks/frame.js
src/legends/swatches.js
src/legends/ramp.js
src/legends.js
src/axis.js
src/memoize.js
src/options.js
src/dimensions.js
src/index.js
src/style.js
src/plot.js
src/scales/quantitative.js
src/scales/diverging.js
src/scales/temporal.js
src/scales/index.js
src/scales/ordinal.js
src/scales/schemes.js
src/transforms/normalize.js
src/transforms/inset.js
src/transforms/bin.js
src/transforms/tree.js
src/transforms/interval.js
src/transforms/window.js
src/transforms/select.js
src/transforms/identity.js
src/transforms/basic.js
src/transforms/map.js
src/transforms/group.js
src/transforms/stack.js
src/defined.js
src/math.js
src/axes.js
src/curve.js
`.trim().split("\n").sort();
return Plot.plot({
  style: "padding: 1px; border: solid;",
  axis: null,
  inset: 10,
  insetRight: 120,
  height: 500,
  marks: Plot.tree(plotsrc, {markerEnd: "arrow"})
});
}
