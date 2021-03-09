import {Mark} from "../mark.js";

export class Compose extends Mark {
  constructor(marks = []) {
    super();
    this.marks = marks;
    // The following fields are set by initialize:
    this.marksChannels = undefined; // array of mark channels
    this.marksIndex = undefined; // array of mark indexes (for non-faceted marks)
  }
  initialize(facets) {
    const marks = this.marks;
    const n = marks.length;
    const marksChannels = this.marksChannels = new Array(n);
    const marksIndex = this.marksIndex = new Array(n);
    for (let i = 0; i < n; ++i) {
      ({index: marksIndex[i], channels: marksChannels[i]} = marks[i].initialize(facets));
    }
    return {index: facets, channels: marksChannels.flat()};
  }
  render(I, scales, channels, options) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (let i = 0; i < this.marks.length; ++i) {
      const mark = this.marks[i];
      const markIndex = this.marksIndex[i];
      const markChannels = Object.create(null);
      for (const [name, channel] of this.marksChannels[i]) {
        if (name !== undefined) {
          markChannels[name] = channel.value;
        }
      }
      const node = mark.render(markIndex, scales, markChannels, options);
      if (node != null) g.appendChild(node);
    }
    return g;
  }
}

export function compose(marks) {
  return new Compose(marks);
}
