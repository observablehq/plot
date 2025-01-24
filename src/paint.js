import {select} from "d3";

export function linearGradient() {
  return {
    paint(context) {
      select(context.ownerSVGElement)
        .append("linearGradient")
        .attr("gradientTransform", "rotate(90)")
        .attr("id", "test-paint")
        .call((gradient) => gradient.append("stop").attr("offset", "5%").attr("stop-color", "purple"))
        .call((gradient) => gradient.append("stop").attr("offset", "75%").attr("stop-color", "red"))
        .call((gradient) => gradient.append("stop").attr("offset", "100%").attr("stop-color", "gold"));
      return "url(#test-paint)";
    }
  };
}
