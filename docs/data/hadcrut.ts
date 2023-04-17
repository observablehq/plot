import {data} from "./hadcrut.data";

export default data.map(([year, anomaly]) => ({year: +year, anomaly: +anomaly}));
