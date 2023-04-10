import {data} from "./penguins.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
