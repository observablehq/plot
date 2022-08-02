/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "interval-tree-1d" {
  export default function IntervalTree(): {
    queryInterval: (lo: number, hi: number, callback: ([lo, hi, j]: [number, number, number]) => void) => any;
    insert: ([lo, hi, j]: [number, number, number]) => void;
  };
}
