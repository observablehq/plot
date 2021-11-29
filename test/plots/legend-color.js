import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export function colorLegendCategorical() {
  return Plot.plot({color: {domain: "ABCDEFGHIJ"}}).legend("color");
}

export function colorLegendCategoricalColumns() {
  return Plot.legend({
    color: {
      domain: [
        "Wholesale and Retail Trade",
        "Manufacturing",
        "Leisure and hospitality",
        "Business services",
        "Construction",
        "Education and Health",
        "Government",
        "Finance",
        "Self-employed",
        "Other"
      ]
    },
    label: "Hello",
    columns: "180px"
  });
}

export function colorLegendCategoricalScheme() {
  return Plot.plot({color: {domain: "ABCDEFGHIJ", scheme: "category10"}}).legend("color");
}

export function colorLegendCategoricalReverse() {
  return Plot.plot({color: {domain: "ABCDEFGHIJ", reverse: true}}).legend("color");
}

export function colorLegendOrdinal() {
  return Plot.plot({color: {type: "ordinal", domain: "ABCDEFGHIJ"}}).legend("color");
}

export function colorLegendOrdinalRamp() {
  return Plot.plot({color: {type: "ordinal", domain: "ABCDEFGHIJ"}}).legend("color", {legend: "ramp"});
}

export function colorLegendOrdinalRampTickSize() {
  return Plot.legend({
    color: {
      domain: [
        "<20",
        "20-29",
        "30-39",
        "40-49",
        "50-59",
        "60-69",
        "≥70"
      ],
      scheme: "Spectral",
      label: "Age (years)"
    },
    legend: "ramp",
    tickSize: 0
  });
}

export function colorLegendOrdinalReverseRamp() {
  return Plot.plot({color: {type: "ordinal", domain: "ABCDEFGHIJ", reverse: true}}).legend("color", {legend: "ramp"});
}

export function colorLegendOrdinalScheme() {
  return Plot.plot({color: {type: "ordinal", domain: "ABCDEFGHIJ", scheme: "rainbow"}}).legend("color");
}

export function colorLegendOrdinalSchemeRamp() {
  return Plot.plot({color: {type: "ordinal", domain: "ABCDEFGHIJ", scheme: "rainbow"}}).legend("color", {legend: "ramp"});
}

export function colorLegendOrdinalTicks() {
  return Plot.legend({color: {type: "categorical", domain: [0, 1, 2, 3, 4], ticks: [0, 1, 4]}, legend: "ramp"});
}

export function colorLegendOrdinalTickFormat() {
  return Plot.plot({color: {type: "ordinal", domain: [1, 2, 3, 4, 5], tickFormat: ".1f"}}).legend("color");
}

export function colorLegendOrdinalTickFormatFunction() {
  return Plot.plot({color: {type: "ordinal", domain: [1, 2, 3, 4, 5], tickFormat: d => d.toFixed(1)}}).legend("color");
}

export function colorLegendQuantitative() {
  return Plot.plot({color: {domain: [0, 10]}}).legend("color");
}

export function colorLegendQuantitativeScheme() {
  return Plot.plot({color: {scheme: "blues", domain: [0, 1]}}).legend("color");
}

export function colorLegendLinear() {
  return Plot.plot({color: {type: "linear", domain: [0, 10]}}).legend("color");
}

export function colorLegendLinearTruncatedScheme() {
  return Plot.plot({color: {scheme: "rainbow", domain: [0, 1], range: [0.5, 1]}}).legend("color");
}

export function colorLegendSqrt() {
  return Plot.plot({color: {type: "sqrt", domain: [0, 10]}}).legend("color");
}

export function colorLegendSqrtPiecewise() {
  return Plot.plot({color: {type: "sqrt", domain: [-100, 0, 100], range: ["blue", "white", "red"]}}).legend("color");
}

export function colorLegendInterpolate() {
  return Plot.plot({color: {domain: [0, 10], range: ["steelblue", "orange"], interpolate: "hcl"}}).legend("color");
}

export function colorLegendInterpolateSqrt() {
  return Plot.plot({color: {type: "sqrt", domain: [0, 10]}}).legend("color");
}

export function colorLegendLog() {
  return Plot.plot({color: {type: "log", domain: [1, 10]}}).legend("color");
}

export function colorLegendLogTicks() {
  return Plot.plot({color: {type: "log", domain: [1, 10]}}).legend("color", {ticks: 10});
}

export function colorLegendLabelScale() {
  return Plot.plot({color: {type: "linear", domain: [0, 10], label: "Scale"}}).legend("color");
}

export function colorLegendLabelLegend() {
  return Plot.plot({color: {type: "linear", domain: [0, 10]}}).legend("color", {label: "Legend"});
}

export function colorLegendLabelBoth() {
  return Plot.plot({color: {type: "linear", domain: [0, 10], label: "Scale"}}).legend("color", {label: "Legend"});
}

export function colorLegendMargins() {
  return Plot.legend({
    color: {
      type: "sqrt",
      domain: [0, 10],
      label: "I feel blue"
    },
    width: 400,
    marginLeft: 150,
    marginRight: 50
  });
}

export function colorLegendThreshold() {
  return Plot.legend({
    color: {
      type: "threshold",
      scheme: "viridis",
      domain: d3.range(1, 10),
      label: "Viridis"
    }
  });
}

export function colorLegendThresholdTickSize() {
  return Plot.legend({
    color: {
      type: "threshold",
      domain: [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
      scheme: "RdBu",
      label: "Unemployment rate (%)"
    },
    tickSize: 0
  });
}

// This quantile scale is implicitly converted to a threshold scale!
export function colorLegendQuantile() {
  return Plot.legend({
    color: {
      type: "quantile",
      scheme: "inferno",
      domain: d3.range(100).map(i => i ** 2),
      quantiles: 7,
      label: "Inferno"
    },
    tickFormat: ",d"
  });
}

// This quantile scale is implicitly converted to a threshold scale!
export function colorLegendQuantileImplicit() {
  return Plot.plot({
    color: {
      type: "quantile",
      scheme: "inferno",
      quantiles: 7,
      label: "Inferno",
      tickFormat: ",d"
    },
    marks: [
      Plot.dot(d3.range(100), {fill: i => i ** 2})
    ]
  }).legend("color");
}

export function colorLegendDiverging() {
  return Plot.legend({
    color: {
      type: "diverging",
      domain: [-0.1, 0.1],
      scheme: "PiYG",
      label: "Daily change"
    },
    tickFormat: "+%"
  });
}

export function colorLegendDivergingPivot() {
  return Plot.legend({
    color: {
      type: "diverging",
      domain: [1, 4],
      pivot: 3,
      scheme: "PiYG"
    }
  });
}

export function colorLegendDivergingPivotAsymmetric() {
  return Plot.legend({
    color: {
      type: "diverging",
      symmetric: false,
      domain: [1, 4],
      pivot: 3,
      scheme: "PiYG"
    }
  });
}

export function colorLegendDivergingSqrt() {
  return Plot.legend({
    color: {
      type: "diverging-sqrt",
      domain: [-0.1, 0.1],
      scheme: "PiYG",
      label: "Daily change"
    },
    tickFormat: "+%"
  });
}
