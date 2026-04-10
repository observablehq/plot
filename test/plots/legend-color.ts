import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(function colorLegendCategorical() {
  return Plot.legend({color: {domain: "ABCDEFGHIJ"}});
});

test(function colorLegendCategoricalColumns() {
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
});

test(function colorLegendCategoricalScheme() {
  return Plot.legend({color: {domain: "ABCDEFGHIJ", scheme: "category10"}});
});

test(function colorLegendCategoricalReverse() {
  return Plot.legend({color: {domain: "ABCDEFGHIJ", reverse: true}});
});

test(function colorLegendDomainUnary() {
  return Plot.legend({color: {domain: [0]}});
});

test(function colorLegendDomainEmpty() {
  return Plot.legend({color: {domain: []}});
});

test(function colorLegendLinearDomainUnary() {
  return Plot.legend({color: {type: "linear", domain: [0]}});
});

test(function colorLegendLinearDomainEmpty() {
  return Plot.legend({color: {type: "linear", domain: []}});
});

test(function colorLegendOrdinal() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ"}});
});

test(function colorLegendOrdinalRamp() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ"}, legend: "ramp"});
});

test(function colorLegendOrdinalRampInline() {
  return Plot.plot({
    legend: "ramp",
    color: {type: "ordinal", domain: "ABCDEFGHIJ"},
    marks: [Plot.cellX("ABCDEFGHIJ")]
  });
});

test(function colorLegendOrdinalRampTickSize() {
  return Plot.legend({
    color: {
      domain: ["<20", "20-29", "30-39", "40-49", "50-59", "60-69", "≥70"],
      scheme: "Spectral",
      label: "Age (years)"
    },
    legend: "ramp",
    tickSize: 0
  });
});

test(function colorLegendOrdinalReverseRamp() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ", reverse: true}, legend: "ramp"});
});

test(function colorLegendOrdinalScheme() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ", scheme: "rainbow"}});
});

test(function colorLegendOrdinalSchemeRamp() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ", scheme: "rainbow"}, legend: "ramp"});
});

test(function colorLegendOrdinalTicks() {
  return Plot.legend({color: {type: "categorical", domain: [0, 1, 2, 3, 4], ticks: [0, 1, 4]}, legend: "ramp"});
});

test(function colorLegendOrdinalTickFormat() {
  return Plot.legend({color: {type: "ordinal", domain: [1, 2, 3, 4, 5], tickFormat: ".1f"}});
});

test(function colorLegendOrdinalTickFormatFunction() {
  return Plot.legend({color: {type: "ordinal", domain: [1, 2, 3, 4, 5], tickFormat: (d) => d.toFixed(1)}});
});

test(function colorLegendQuantitative() {
  return Plot.legend({color: {domain: [0, 10]}});
});

test(function colorLegendQuantitativeScheme() {
  return Plot.legend({color: {scheme: "blues", domain: [0, 1]}});
});

test(function colorLegendLinear() {
  return Plot.legend({color: {type: "linear", domain: [0, 10]}});
});

test(function colorLegendLinearNoTicks() {
  return Plot.legend({color: {type: "linear", tickFormat: null, domain: [0, 10]}});
});

test(function colorLegendLinearTruncatedScheme() {
  return Plot.legend({color: {scheme: "rainbow", domain: [0, 1], range: [0.5, 1]}});
});

test(function colorLegendSqrt() {
  return Plot.legend({color: {type: "sqrt", domain: [0, 10]}});
});

test(function colorLegendSqrtPiecewise() {
  return Plot.legend({color: {type: "sqrt", domain: [-100, 0, 100], range: ["blue", "white", "red"]}});
});

test(function colorLegendInterpolate() {
  return Plot.legend({color: {domain: [0, 10], range: ["steelblue", "orange"], interpolate: "hcl"}});
});

test(function colorLegendInterpolateSqrt() {
  return Plot.legend({color: {type: "sqrt", domain: [0, 10]}});
});

test(function colorLegendLog() {
  return Plot.legend({color: {type: "log", domain: [1, 10]}});
});

test(function colorLegendLogTicks() {
  return Plot.legend({color: {type: "log", domain: [1, 10], ticks: 10}});
});

test(function colorLegendLabelScale() {
  return Plot.legend({color: {type: "linear", domain: [0, 10], label: "Scale"}});
});

test(function colorLegendLabelLegend() {
  return Plot.legend({color: {type: "linear", domain: [0, 10]}, label: "Legend"});
});

test(function colorLegendLabelBoth() {
  return Plot.legend({color: {type: "linear", domain: [0, 10], label: "Scale"}, label: "Legend"});
});

test(function colorLegendMargins() {
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
});

test(function colorLegendThreshold() {
  return Plot.legend({
    color: {
      type: "threshold",
      scheme: "viridis",
      domain: d3.range(1, 10),
      label: "Viridis"
    }
  });
});

test(function colorLegendThresholdTickSize() {
  return Plot.legend({
    color: {
      type: "threshold",
      domain: [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
      scheme: "RdBu",
      label: "Unemployment rate (%)"
    },
    tickSize: 0
  });
});

// Quantile scales are implicitly converted to threshold scales.
test(function colorLegendQuantile() {
  return Plot.legend({
    color: {
      type: "quantile",
      scheme: "inferno",
      domain: d3.range(100).map((i) => i ** 2),
      n: 7,
      label: "Inferno"
    },
    tickFormat: ",d"
  });
});

test(function colorLegendQuantileImplicit() {
  return Plot.plot({
    color: {
      type: "quantile",
      scheme: "inferno",
      n: 7,
      label: "Inferno",
      tickFormat: ",d"
    },
    marks: [Plot.dot(d3.range(100), {fill: (i) => i ** 2})]
  }).legend("color");
});

test(function colorLegendQuantileSwatches() {
  return Plot.legend({
    legend: "swatches",
    color: {
      type: "quantile",
      scheme: "inferno",
      domain: d3.range(100).map((i) => i ** 2),
      n: 7,
      label: "Inferno"
    },
    tickFormat: ",d"
  });
});

// Quantize scales are implicitly converted to threshold scales.
test(function colorLegendQuantize() {
  return Plot.legend({
    color: {
      type: "quantize",
      domain: [1, 144],
      n: 7,
      label: "quantize scale"
    }
  });
});

test(function colorLegendQuantizeDescending() {
  return Plot.legend({
    color: {
      type: "quantize",
      domain: [144, 1],
      label: "quantize descending"
    }
  });
});

test(function colorLegendQuantizeDescendingReversed() {
  return Plot.legend({
    color: {
      type: "quantize",
      domain: [10, 0.1],
      reverse: true,
      label: "quantize descending reversed"
    }
  });
});

test(function colorLegendQuantizeRange() {
  return Plot.legend({
    color: {
      type: "quantize",
      domain: [1, 144],
      range: d3.schemeBlues[5],
      label: "quantize scale"
    }
  });
});

test(function colorLegendQuantizeReverse() {
  return Plot.legend({
    color: {
      type: "quantize",
      domain: [-49.99, 91.61],
      reverse: true,
      label: "quantize reversed"
    }
  });
});

test(function colorLegendImplicitLabel() {
  return Plot.plot({
    color: {scheme: "viridis"},
    marks: [
      Plot.dot(
        d3.range(100).map((i) => ({thing: i})),
        {fill: "thing"}
      )
    ]
  }).legend("color");
});

test(function colorLegendDiverging() {
  return Plot.legend({
    color: {
      domain: [-0.1, 0.1],
      scheme: "PiYG",
      label: "Daily change"
    },
    tickFormat: "+%"
  });
});

test(function colorLegendDivergingPivot() {
  return Plot.legend({
    color: {
      domain: [1, 4],
      pivot: 3,
      scheme: "PiYG"
    }
  });
});

test(function colorLegendDivergingPivotAsymmetric() {
  return Plot.legend({
    color: {
      symmetric: false,
      domain: [1, 4],
      pivot: 3,
      scheme: "PiYG"
    }
  });
});

test(function colorLegendDivergingSqrt() {
  return Plot.legend({
    color: {
      type: "diverging-sqrt",
      domain: [-0.1, 0.1],
      scheme: "PiYG",
      label: "Daily change"
    },
    tickFormat: "+%"
  });
});

test(function colorSchemesOrdinal() {
  const div = document.createElement("DIV");
  for (const scheme of [
    "accent",
    "category10",
    "dark2",
    "paired",
    "pastel1",
    "pastel2",
    "set1",
    "set2",
    "set3",
    "tableau10",
    "brbg",
    "prgn",
    "piyg",
    "puor",
    "rdbu",
    "rdgy",
    "rdylbu",
    "rdylgn",
    "spectral",
    "burd",
    "buylrd",
    "blues",
    "greens",
    "greys",
    "oranges",
    "purples",
    "reds",
    "turbo",
    "viridis",
    "magma",
    "inferno",
    "plasma",
    "cividis",
    "cubehelix",
    "warm",
    "cool",
    "bugn",
    "bupu",
    "gnbu",
    "orrd",
    "pubu",
    "pubugn",
    "purd",
    "rdpu",
    "ylgn",
    "ylgnbu",
    "ylorbr",
    "ylorrd",
    "rainbow",
    "sinebow"
  ] as const) {
    div.append(
      Plot.legend({color: {type: "ordinal", scheme, domain: [scheme]}}),
      Plot.legend({color: {type: "ordinal", scheme, domain: [scheme, ...`1`]}}),
      Plot.legend({color: {type: "ordinal", scheme, domain: [scheme, ...`123`]}}),
      Plot.legend({color: {type: "ordinal", scheme, domain: [scheme, ...`12345678`]}}),
      Plot.legend({color: {type: "ordinal", scheme, domain: [scheme, ...`1234567890ABCD`]}})
    );
  }
  return div;
});

test(function colorSchemesQuantitative() {
  const div = document.createElement("DIV");
  for (const scheme of [
    "brbg",
    "prgn",
    "piyg",
    "puor",
    "rdbu",
    "rdgy",
    "rdylbu",
    "rdylgn",
    "spectral",
    "burd",
    "buylrd",
    "blues",
    "greens",
    "greys",
    "purples",
    "reds",
    "oranges",
    "turbo",
    "viridis",
    "magma",
    "inferno",
    "plasma",
    "cividis",
    "cubehelix",
    "warm",
    "cool",
    "bugn",
    "bupu",
    "gnbu",
    "orrd",
    "pubugn",
    "pubu",
    "purd",
    "rdpu",
    "ylgnbu",
    "ylgn",
    "ylorbr",
    "ylorrd",
    "rainbow",
    "sinebow"
  ] as const) {
    div.append(Plot.legend({color: {type: "linear", scheme}, label: scheme, ticks: 0, tickSize: 0, marginBottom: 10}));
  }
  return div;
});

test(async function colorLegendOpacity() {
  return Plot.legend({color: {domain: ["Dream", "Torgersen", "Biscoe"]}, opacity: 0.5});
});

test(async function colorLegendOpacityRamp() {
  return Plot.legend({color: {domain: [0, 1000]}, opacity: 0.5});
});

test(function colorLegendOpacityOrdinalRamp() {
  return Plot.legend({color: {type: "ordinal", domain: "ABCDEFGHIJ"}, legend: "ramp", opacity: 0.5});
});
