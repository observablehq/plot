export function maybeTimeFilter(filter = "eq") {
  switch (`${filter}`.toLowerCase()) {
    case "lt": return timeLt;
    case "lte": return timeLte;
    case "gt": return timeGt;
    case "gte": return timeGte;
    case "eq": return timeEq;
  }
  throw new Error(`invalid time filter: ${filter}`);
}

function timeLt(I, T, time) {
  return I.filter(i => T[i] < time);
}

function timeLte(I, T, time) {
  return I.filter(i => T[i] <= time);
}

function timeGt(I, T, time) {
  return I.filter(i => T[i] > time);
}

function timeGte(I, T, time) {
  return I.filter(i => T[i] >= time);
}

function timeEq(I, T, time) {
  return I.filter(i => T[i] === time);
}
