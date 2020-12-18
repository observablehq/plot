import {create} from "d3-selection";
import {Mark} from "../mark.js";

export class Compose extends Mark {
  constructor(
    marks = []
  ) {
    const submarkChannels = new Map();
    const submarkIndex = new Map();
    const subchannels = [];

    // duplicate initialization from plot.js for submarks
    for (const [i, mark] of marks.entries()) {
      const named = Object.create(null);
      const {index, channels} = mark.initialize(mark.data);
      for (const [name, channel] of channels) {
        if (name !== undefined) {
          named[name] = channel.value;
        }
        // collect and flatten all the channels from child marks so Plot can autoScale;
        subchannels.push({
          ...mark.channels.find(channel => channel.name === name),
          name: `mark${i}.${name}`, // namespace to avoid collisions
          value: channel.value
        });
      }
      submarkChannels.set(mark, named);
      submarkIndex.set(mark, index);
    }

    super(
      [],
      subchannels,
      d => d
    );

    this.marks = marks;
    this.submarkChannels = submarkChannels;
    this.submarkIndex = submarkIndex;
  }
  render(I, scales, channels, options) {
    // since index and channels will vary by submark, the `submarkChannels` and
    // `submarkIndex` maps are used instead of `I` (which is empty) and
    // `channels` (which is flattened); maybe wasteful!
    const g = create("svg:g");
    for (const mark of this.marks) {
      const subchannels = this.submarkChannels.get(mark);
      const subindex = this.submarkIndex.get(mark);
      const node = mark.render(subindex, scales, subchannels, options);
      if (node != null) g.append(() => node);
    }
    return g.node();
  }
}

export function compose(data, options) {
  return new Compose(data, options);
}
