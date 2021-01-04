import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  const letters = [...mobydick].filter(d => /\w/.test(d));
  const moby = {
    letters,
    case: letters.map(d => d.toLowerCase() === d ? "lower" : "upper"),
    vowel: letters.map(d => /[aeiouy]/i.test(d) ? "vowel" : "")
  };

  const defA = {
    x: {
      axis: null
    },
    y: {
      axis: null
    },
    facet: {
      data: moby.letters,
      x: moby.vowel,
      y: moby.case
    },
    marks: [
      Plot.groupX(moby.letters, { x: d => d.toLowerCase() }),
      Plot.ruleY([0])
    ]
  };

/*  todo cf #50
  const defB = {
    facet: {
      data: moby.letters,
      x: moby.vowel,
      y: moby.case
    },
    marks: [
      Plot.groupX(moby.letters, {x: moby.letters.map(d => d.toLowerCase())}),
      Plot.ruleY([0])
    ]
  };
*/

  return Plot.plot(defA);
}
