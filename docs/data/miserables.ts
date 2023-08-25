import {data} from "./miserables.data";

export default Object.assign(data, {groups: new Map(data.nodes.map((d) => [d.id, d.group]))});
