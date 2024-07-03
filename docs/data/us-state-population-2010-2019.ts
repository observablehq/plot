import {data} from "./us-state-population-2010-2019.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
