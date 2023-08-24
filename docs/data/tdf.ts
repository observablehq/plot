import {data} from "./tdf.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
