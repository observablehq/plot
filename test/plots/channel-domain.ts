import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

async function countNationality(sort: Plot.ChannelDomainSort) {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.barX(athletes, Plot.groupY({x: "count"}, {y: "nationality", sort})).plot();
}

test(async function channelDomainDefault() {
  return countNationality({y: "x", limit: 20});
});

test(async function channelDomainDefaultReverse() {
  return countNationality({y: "x", reverse: true, limit: 20});
});

test(async function channelDomainAscending() {
  return countNationality({y: "x", order: "ascending", limit: 20});
});

test(async function channelDomainAscendingReverse() {
  return countNationality({y: "x", order: "ascending", reverse: true, limit: 20});
});

test(async function channelDomainDescending() {
  return countNationality({y: "x", order: "descending", limit: 20});
});

test(async function channelDomainDescendingReverse() {
  return countNationality({y: "x", order: "descending", reverse: true, limit: 20});
});

test(async function channelDomainMinus() {
  return countNationality({y: "-x", limit: 20});
});

test(async function channelDomainMinusReverse() {
  return countNationality({y: "-x", reverse: true, limit: 20});
});

test(async function channelDomainComparator() {
  return countNationality({y: "x", order: ([, a], [, b]) => d3.descending(a, b), limit: 20});
});

test(async function channelDomainComparatorReverse() {
  return countNationality({y: "x", order: ([, a], [, b]) => d3.ascending(a, b), reverse: true, limit: 20});
});

// This test avoids the group transform because the group transform always sorts
// groups in natural ascending order by key. (Perhaps there should be an option
// to disable that behavior?)
async function groupNationality(sort: Plot.ChannelDomainSort) {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  const nationalities = d3.groups(athletes, (d) => d.nationality);
  const count = Object.assign(([, D]) => D.length, {label: "Frequency"});
  const key = Object.assign(([d]) => d, {label: "nationality"});
  return Plot.barX(nationalities, {x: count, y: key, sort}).plot();
}

test(async function channelDomainNull() {
  return groupNationality({y: "x", order: null, limit: 20});
});

test(async function channelDomainNullReverse() {
  return groupNationality({y: "x", order: null, reverse: true, limit: 20});
});

async function weightNationality(sort: Plot.ChannelDomainSort) {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.tickX(athletes, {x: "weight", y: "nationality", sort}).plot();
}

test(async function channelDomainReduceCount() {
  return weightNationality({y: "x", reduce: "count", order: "descending", limit: 20});
});

test(async function channelDomainReduceDefault() {
  return weightNationality({y: "x", order: "descending", limit: 20}); // reduce: "max"
});
