import {data} from "./civilizations.data";
import {autoType} from "d3";

export default data.map(({...d}) => autoType(d));
