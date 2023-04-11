import {data as us} from "./us-counties-10m.data";
import * as topojson from "topojson-client";

export default us;

export const nation = topojson.feature(us, us.objects.nation);

export const states = topojson.feature(us, us.objects.states);

export const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

export const counties = topojson.feature(us, us.objects.counties);
