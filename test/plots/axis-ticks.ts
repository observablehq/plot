import * as Plot from "@observablehq/plot";

const tickFormat = function (t, i, e) {
  return i === 0 ? "<" : i === e.length - 1 ? ">" : t;
};

export async function axisTickFormatColorLinear() {
  return Plot.legend({
    color: {type: "linear", tickFormat}
  });
}

export async function axisTickFormatColorQuantize() {
  return Plot.legend({
    color: {type: "quantize", tickFormat}
  });
}

export async function axisTickFormatColorSwatches() {
  return Plot.legend({
    legend: "swatches",
    color: {
      type: "quantize",
      tickFormat
    }
  });
}

export async function axisTickFormatX() {
  return Plot.plot({
    x: {type: "linear", tickFormat}
  });
}
