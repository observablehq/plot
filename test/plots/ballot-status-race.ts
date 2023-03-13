import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function ballotStatusRace() {
  let votes: any = await d3.csv<any>("data/nc-absentee-votes.csv", d3.autoType);

  // Filter for mail ballots.
  const types = ["MAIL"];
  votes = votes.filter((d) => types.includes(d.ballot_req_type));

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
  votes = votes.map((d) => ({
    ...d,
    status: statuses.get(d.ballot_rtn_status) || d.ballot_rtn_status
  }));

  // Group by race,
  // then by (normalized) status,
  // then rollup the count for each group.
  let rollup: any = d3.rollups(
    votes,
    (votes) => d3.sum(votes, (d: any) => d.count),
    (d: any) => d.race,
    (d: any) => d.status
  );

  // Compute the count for each race,
  // then the percentage for each status within each race.
  rollup = rollup.flatMap(([race, group]: any) => {
    const total = d3.sum(group, ([, count]: any) => count);
    return group.map(([status, count]: any) => {
      return {race, status, percent: (count / total) * 100};
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
      label: null
    },
    color: {
      domain: ["ACCEPTED", "REJECTED", "PENDING"],
      range: ["currentColor", "brown", "gray"]
    },
    facet: {
      data: rollup,
      y: "race",
      marginLeft: 210
    },
    marks: [
      Plot.barX(rollup, {
        x: "percent",
        y: "status",
        fill: "status",
        title: (d) => `${d.percent.toFixed(1)}%`,
        sort: {
          fy: "data",
          reduce: (data) => data.find((d) => d.status === "ACCEPTED").percent,
          reverse: true
        }
      }),
      Plot.ruleX([0])
    ]
  });
}
