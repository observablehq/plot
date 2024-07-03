import {data} from "./olympians.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
