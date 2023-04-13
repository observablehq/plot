import * as Plot from "@observablehq/plot";
import {h, withDirectives} from "vue";

class Document {
  constructor() {
    this.documentElement = new Element(this, "html");
  }
  createElementNS(namespace, tagName) {
    return new Element(this, tagName);
  }
  createElement(tagName) {
    return new Element(this, tagName);
  }
  createTextNode(value) {
    return new TextNode(this, value);
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
}

class Style {
  static empty = new Style();
  setProperty() {}
  removeProperty() {}
}

class Element {
  constructor(ownerDocument, tagName) {
    this.ownerDocument = ownerDocument;
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  setAttributeNS(namespace, name, value) {
    this.attributes[name] = String(value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  removeAttributeNS(namespace, name) {
    delete this.attributes[name];
  }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  insertBefore(child, after) {
    if (after == null) {
      this.children.push(child);
    } else {
      const i = this.children.indexOf(after);
      if (i < 0) throw new Error("insertBefore reference node not found");
      this.children.splice(i, 0, child);
    }
    child.parentNode = this;
    return child;
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  set textContent(value) {
    this.children = [this.ownerDocument.createTextNode(value)];
  }
  set style(value) {
    this.attributes.style = value;
  }
  get style() {
    return Style.empty;
  }
  toHyperScript() {
    return h(
      this.tagName,
      this.attributes,
      this.children.map((c) => c.toHyperScript())
    );
  }
}

class TextNode {
  constructor(ownerDocument, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeValue = String(nodeValue);
  }
  toHyperScript() {
    return this.nodeValue;
  }
}

const plotel = new WeakMap();

export default {
  props: ["options", "mark", "mode"],
  render() {
    const options = {
      marks: this.mark == null ? [] : [this.mark],
      ...this.options,
      style: "background: none;",
      className: "plot"
    };
    if (this.mode === "defer") {
      const render = (el) => {
        if (!plotel.has(el)) plotel.set(el, el);
        let idling = null;
        function observed() {
          const plot = Plot.plot(options);
          plotel.get(el).replaceWith(plot);
          plotel.set(el, plot);
          observer.disconnect();
          if (idling !== null) {
            cancelIdleCallback(idling);
            idling = null;
          }
        }
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) observed();
          },
          {rootMargin: "100px"}
        );
        observer.observe(el);
        if (typeof requestIdleCallback === "function") {
          idling = requestIdleCallback(observed);
        }
      };
      return withDirectives(h("figure", {style: "height: 400px;"}), [
        [
          {
            mounted: render,
            updated: render,
            unmounted: (el) => {
              plotel.get(el).remove();
              plotel.delete(el);
            }
          }
        ]
      ]);
    }
    options.document = new Document();
    return Plot.plot(options).toHyperScript();
  }
};
