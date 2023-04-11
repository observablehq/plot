import {data} from "./us-presidential-election-2020.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
