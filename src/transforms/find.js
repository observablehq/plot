import {groupX} from "./group.js";

export function findX(outputs, options) {
  const [outputOptions, tests] = splitOptions(outputs);
  return groupX(
    {
      ...outputOptions,
      ...Object.fromEntries(
        Object.entries(tests).map(([key, test]) => [
          key,
          {reduceIndex: (I, V, {data}) => V[I.find((i) => test(data[i], i, data))]}
        ])
      )
    },
    options
  );
}

function splitOptions({data, filter, sort, reverse, ...tests}) {
  return [{data, filter, sort, reverse}, tests];
}
