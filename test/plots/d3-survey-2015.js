import * as Plot from "@observablehq/plot";
import {ascending, descending, mean, rollups} from "d3-array";
import {json} from "d3-fetch";

export default async function() {
  const responses = await json("data/d3-survey-2015.json");
  return chooseOne(responses, "comfort", "How comfortable are you with d3 now?");
  // TODO Support multiple outputs from tests.
  // return [
  //   chooseOne(responses, "comfort", "How comfortable are you with d3 now?"),
  //   chooseMany(responses, "why", "Why do you want to learn d3?"),
  //   chooseMany(responses, "tech", "Have you used any of the following technologies?"),
  //   chooseMany(responses, "projects", "What kind of projects do you want to use d3 for?"),
  //   chooseOne(responses, "forloops", "Are you comfortable with for loops?"),
  //   chooseOne(responses, "trig", "Do you remember trigonometry?"),
  //   chooseOne(responses, "gestalt", "Does the word gestalt mean anything to you?"),
  //   chooseOne(responses, "tools", "What is your favorite tool for data visualization so far?"),
  //   chooseMany(responses, "libraries", "Have you used any of the following libraries?"),
  //   chooseOne(responses,  "feature", "Which feature of d3 get you most excited?"),
  //   chooseMany(responses, "format", "Which formats would you be interested in paying for to learn d3?"),
  //   chooseOne(responses, "city", "What city are you in?")
  // ];
}

// TODO consolidate bars into Other category
function chooseOne(responses, y, title) {
  return bars(
    rollups(responses, group => group.length / responses.length, d => d[y]),
    title
  );
}

// TODO Support multiple outputs from tests.
// eslint-disable-next-line no-unused-vars
function chooseMany(responses, y, title) {
  return bars(
    Array.from(
      new Set(responses.flatMap(d => d[y])),
      v => [v, mean(responses, d => d[y].includes(v))]
    ),
    title
  );
}

function bars(groups, title) {
  return Plot.plot({
    marginLeft: 300,
    width: 960,
    height: groups.length * 20 + 50,
    x: {
      grid: true,
      axis: "top",
      domain: [0, 100],
      label: "Frequency (%) →"
    },
    y: {
      padding: 0,
      label: title,
      labelAnchor: "top",
      domain: groups.map(([key, value]) => [key, value])
        .sort(([ak, av], [bk, bv]) => descending(av, bv) || ascending(ak, bk))
        .map(([key]) => key)
    },
    marks: [
      Plot.barX(groups, {
        x: ([, value]) => value * 100,
        y: ([key]) => key,
        fill: "steelblue",
        insetTop: 1
      }),
      Plot.ruleX([0])
    ]
  });
}
