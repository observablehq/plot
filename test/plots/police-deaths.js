import * as Plot from "@observablehq/plot";

const data = [
  {"type":"police","race":"Black","value":44},
  {"type":"population","race":"Black","value":13},
  {"type":"police","race":"Hispanic","value":32},
  {"type":"population","race":"Hispanic","value":12},
  {"type":"police","race":"White","value":18},
  {"type":"population","race":"White","value":60},
  {"type":"police","race":"All other races","value":6},
  {"type":"population","race":"All other races","value":15}
];

const zOrder = ["White", "Hispanic", "Black"];

export default async function() {
  return Plot.plot({
  
    x: {
      axis: "top",
      domain: ["---", "--", "-", "police", "-1", "0", "1", "population", "+", "++", "+++"],
      ticks: ["--", "++"],
      label: "",
      tickFormat: d => d === "++" ? "share of the population" : "share of deaths by police"
    },
    
    y: { axis: null },
  
    marks: [
      
      // fill
      Plot.stackAreaY(data.flatMap(d => d.type === "police" ? [{...d, type:"-"}, d] : [d, {...d, type:"+"}]), {
        x: "type", y: "value", fill: "race", curve: "monotone-x",
        z: "race", zOrder
      }),
      
      // dashed lines
      Plot.stackLineY(data.flatMap(d => d.type === "police" ? [{...d, type:"-"}, d] : [d, {...d, type:"+"}]), {
        x: "type", y: "value",
        z: "race", zOrder,
        stroke: "black", curve: "monotone-x", strokeWidth: 0.5,
        position: "center",
        strokeDasharray: [5, 5]
      }),
      
      // top black lines
      Plot.stackLineY(data.flatMap(d => d.type === "police" ? [{...d, type:"---"}, d] : [d, {...d, type:"+++"}]), {
        x: "type", y: "value",
        z: "race", zOrder,
        stroke: "black", curve: "monotone-x", strokeWidth: 2
      }),
  
      // bottom black line
      Plot.line([{ type:"---" }, { type: "+++" }], {
        x: "type",
        y: () => 0,
        stroke: "black", strokeWidth: 2
      }),
  
      // text
      Plot.text(...Plot.stackY(
        data.map(d => ({...d, type: d.type === "police" ? "--" : "++"})),
        {
          x: "type",
          y: "value",
          z: "race",
          zOrder,
          text: d => `${d.race} ${d.value}%`
        }
      ))
      
    ],
    marginBottom: 12
  });
}
