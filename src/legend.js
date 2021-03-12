import {axisBottom, create, format, interpolate, interpolateRound, range, scaleBand, scaleLinear, quantile, quantize} from "d3";

export function Legend(
  {color: colorScale},
  {color} = {}
) {
  return {
    ...(color && color.legend && {color: new ColorLegend(colorScale, color)})
  };
}

export class ColorLegend {
  constructor({name}, color) {
    this.name = name || "color";
    this.color = color;
  }
  render(
    index,
    {[this.name]: color}
    ,
    channels,
    {
      width: canvasWidth,
      height: canvasHeight
    }
  ) {
    let { color: {
      legend: {
        title,
        tickSize = 6,
        width = 320,
        height = 44 + tickSize,
        top = title === undefined ? -20 : -3,
        right = 0,
        bottom,
        left,
        ticks = width / 64,
        tickFormat,
        tickValues
      } = {}
    } = {} } = this;
    const tx = left !== undefined ? left : canvasWidth - width + right;
    const ty = bottom !== undefined ? canvasHeight - bottom - height : top;
    return create("svg:g")
        .attr("transform", `translate(${tx},${ty})`)
        .call(g => legend(g, {color, title, tickSize, width, height, ticks, tickFormat, tickValues}))
      .node();
  }
}

function legend(svg, {
  color,
  title,
  tickSize,
  width, 
  height,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks,
  tickFormat,
  tickValues
} = {}) {

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = range(n).map(i => quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? format(tickFormat)
        : tickFormat;

    x = scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal, bar
  else if (false) {
    x = scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }
  // ordinal, swatches
  else {
    return swatches(svg, {
      color,
      title,
      // tickSize,
      width, 
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      ticks,
      tickFormat
      //, tickValues
    });
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(title ? (g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title)) : () => {});

  return svg.node();
}


function ramp(color, n = 256) {
  const canvas = create("canvas")
    .attr("width", n)
    .attr("height", 1)
    .node();
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

function swatches(svg, {
  color,
  title,
//  tickSize,
  width, 
  height,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  ticks,
  tickFormat
  // , tickValues
}) {
  const l = svg.append("g").attr("transform", `translate(0,${height - marginBottom})`);
  const n = ticks; // maximum swatches per row (maybe we shouldn't use ticks?)
  const cwidth = (width - marginLeft - marginRight) / Math.max(1, Math.min(n, color.domain().length));
  
  if (tickFormat === undefined) tickFormat = d => shorten(d, cwidth / 7);
  
  const domain = color.domain().map(d => ({
    d,
    fill: color(d),
    text: tickFormat(d)
  }))
  .filter(d => d.text);
  
  const cheight = 20;
  const swatches = l.append("g")
    .selectAll()
    .data(domain)
    .join("g")
      .attr("transform", (_,i) => `translate(${(i % n) * cwidth},${Math.floor(i/n) * cheight})`);
  swatches.append("rect").attr("y", -5).attr("height", 10).attr("width", 10).attr("fill", d => d.fill);
  swatches.append("text").attr("dx", 13).attr("text-anchor", "start").attr("dy", "0.35em").text(d => d.text);
  
  if (title) {
    l.append("text")
      .attr("x", marginLeft)
      .attr("y", marginTop + marginBottom - height - 6)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .attr("class", "title")
      .text(title);
  }
   
 
 return svg.node();
}

function shorten(text, l = 20) {
  text = String(text);
  return (text.length > l) ? text.substring(0, l - 3).concat("…") : text;
}