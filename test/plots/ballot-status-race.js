import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  let votes = await d3.csv("data/nc-absentee-votes.csv", d3.autoType);

  // Filter for mail ballots.
  const types = ["MAIL"];
  votes = votes.filter(d => types.includes(d.ballot_req_type));

  // Filter for specific races.
  // const races = ["BLACK or AFRICAN AMERICAN", "WHITE"];
  // votes = votes.filter(d => races.includes(d.race));

  // Normalize the ballot status (accepted/pending/rejected). This is a fairly
  // long list because we don’t want to misinterpret an unknown status.
  const statuses = new Map([
    ["ACCEPTED - CURED", "ACCEPTED"],
    ["PENDING CURE", "PENDING"],
    ["SPOILED", "REJECTED"],
    ["RETURNED UNDELIVERABLE", "REJECTED"],
    ["WITNESS INFO INCOMPLETE", "REJECTED"],
    ["DUPLICATE", "REJECTED"],
    ["ASSISTANT INFO INCOMPLETE", "REJECTED"],
    ["E-TRANSMISSION FAILURE", "REJECTED"],
    ["CONFLICT", "REJECTED"],
    ["SIGNATURE DIFFERENT", "REJECTED"],
    ["NO TIME FOR CURE - CONTACTED", "REJECTED"],
    ["NOT PROPERLY NOTARIZED", "REJECTED"]
  ]);
  votes = votes.map(d => ({
    ...d,
    status: statuses.get(d.ballot_rtn_status) || d.ballot_rtn_status
  }));

  // Group by race,
  // then by (normalized) status,
  // then rollup the count for each group.
  let rollup = d3.rollups(
    votes,
    votes => d3.sum(votes, d => d.count),
    d => d.race,
    d => d.status
  );

  // Compute the count for each race,
  // then the percentage for each status within each race.
  rollup = rollup.flatMap(([race, group]) => {
    const total = d3.sum(group, ([, count]) => count);
    return group.map(([status, count]) => {
      return {race, status, percent: count / total * 100};
    });
  });

  return Plot.plot({
    x: {
      grid: true,
      label: "Frequency (%) →"
    },
    y: {
      domain: ["ACCEPTED", "REJECTED", "PENDING"],
      axis: null
    },
    fy: {
      domain: d3.groupSort(rollup, group => -group.find(d => d.status === "ACCEPTED").percent, d => d.race),
      label: null
    },
    color: {
      type: "ordinal",
      domain: ["ACCEPTED", "REJECTED", "PENDING"],
      range: ["currentColor", "brown", "gray"]
    },
    facet: {
      data: rollup,
      y: "race",
      marginLeft: 210
    },
    marks: [
      Plot.barX(rollup, {x: "percent", y: "status", fill: "status", title: d => `${d.percent.toFixed(1)}%`}),
      Plot.ruleX([0])
    ]
  });
}
