// IGNORE THIS FOR NOW, IT'S JUST ME CRAWLING ALONG PIECING TOGETHER WHAT THE
// "PLOT.COMPOSE" MARK MAY NEED… IT'S ALL ONE BIG "TODO"… HAVENT EVEN TESTED ONCE :)

import {create} from "d3-selection";
import {Mark, Channel} from "../mark.js";

export class Compose extends Mark {
  constructor(
    data,
    marks = [],
    transform
  ) {
    // collect all the channels from child marks and normalize their values
    const subchannels = marks.flatMap((mark, i) =>
      mark.channels.map((channel) => ({
        ...channel,
        name: `mark${i}.${channel.name}`, //namespacing
        value: Channel(mark.data, channel).value
      }))
    );
    super(
      data,
      subchannels,
      transform
    );
    this.marks = marks;
  }
  // TODO: initialize
  render(I, scales, channels, options) {
    const g = create("svg:g");
    for (const [i, mark] of this.marks.entries()) {
      const subchannels = channels
        .filter(({name}) => name.indexOf(`mark${i}`) === 0)
        .map(channel => ({...channel, name: name.replace(`mark${i}`, "")}));
      const node = mark.render(I, scales, subchannels, options);
      if (node != null) g.append(() => node);
    }
    return g;
  }
}

export function compose(data, options) {
  return new Compose(data, options);
}
