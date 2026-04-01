import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function lineInterval() {
  const random = d3.randomLcg(42);
  const logins = ["Alice", "Bob", "Carol", "Dave", "Eve"];
  const dates = d3.utcDays(new Date("2024-01-01"), new Date("2024-01-15"));
  const activity = dates.flatMap((date) => logins.filter(() => random() > 0.15).map((login) => ({date, login})));
  return Plot.plot({
    height: 200,
    marks: [
      Plot.ruleY([0]),
      Plot.areaY(activity, {
        x: "date",
        interval: "day",
        fill: "login",
        order: "-sum",
        fillOpacity: 0.3,
        y: 1,
        curve: "catmull-rom"
      }),
      Plot.lineY(
        activity,
        Plot.stackY({x: "date", interval: "day", stroke: "login", order: "-sum", curve: "catmull-rom"})
      ),
      Plot.dot(activity, Plot.stackY({x: "date", interval: "day", z: "login", fill: "login", order: "-sum"}))
    ]
  });
});
