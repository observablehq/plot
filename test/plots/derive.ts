import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// TODO In some cases, the derived mark might want to be drawn below its source
// mark; using the order of marks is generally fine because the initializer runs
// after the channels have been initialized, but it doesn’t work if the source
// mark has its own initializer. So, we’d either want to throw an error if the
// source mark has its own initializer, or require that the derived mark be
// listed after the source mark (and perhaps have a separate way to adjust the
// z-order after initialization), or implement topological sort to initialize
// derived marks (probably the best solution, since the user shouldn’t have to
// think about the order of initialization operations).
function derive(mark, options) {
  return Plot.initializer(options, (data, facets, _channels, scales, dimensions, context) => {
    const {channels, ...state} = context.getMarkState(mark);
    return {...state, channels: Object.fromEntries(Object.entries(channels).filter(([name]) => !(name in options)))};
  });
}

function deriver(Mark, data) {
  return (options, ...rest) => {
    const source = Mark(data, options);
    return Plot.marks(source, ...rest.map((options) => Mark(data, derive(source, options))));
  };
}

export async function deriveDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return deriver(Plot.dot, penguins)(
    {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      r: d3.randomLcg(42),
      fill: "species",
      render: (index, scales, values, dimensions, context, next) =>
        next(
          index,
          scales,
          {
            ...values,
            r: values.r.map((d) => d + 6),
            fill: values.fill.map((d) => d3.interpolateRgb("white", d)(0.5))
          },
          dimensions,
          context
        )
    },
    {
      fill: "white",
      stroke: "species",
      paintOrder: "stroke"
    }
  ).plot();
}
