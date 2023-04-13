import {data} from "./crimea.data";
import {autoType} from "d3";

export default data.columns
  .slice(2)
  .flatMap((cause) => (data.rows as any[]).map(({date, [cause]: deaths}) => autoType({date, cause, deaths})));
