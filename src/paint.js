import {create} from "./context.js";

export function linearGradient() {
  return {
    paint(context) {
      const gradient = create("svg:linearGradient", context).attr("gradientTransform", "rotate(90)");
      gradient.append("stop").attr("offset", "5%").attr("stop-color", "purple");
      gradient.append("stop").attr("offset", "75%").attr("stop-color", "red");
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "gold");
      return gradient.node();
    }
  };
}
