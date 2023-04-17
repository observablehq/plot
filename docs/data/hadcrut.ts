import {data} from "./hadcrut.data";

export default data.map(([year, anomaly]) => ({
  // extract the year and median anomaly
  year: new Date(Date.UTC(year, 0, 1)),
  anomaly: +anomaly
}));
