import {data} from "./bls-industry-unemployment.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
