import {randomLcg} from "d3";

export function noise() {
  return randomLcg(42);
}
