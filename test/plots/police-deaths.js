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

const rank = ["White", "Hispanic", "Black"];

const selectY = (({y1, y2, ...rest}, position) => ({
  y: {
    transform() {
      const Y1 = y1.transform();
      const Y2 = y2.transform();
      return position === "top" ? Y2
        : position === "bottom" ? Y1
        : Float64Array.from(Y1, (_, i) => (Y1[i] + Y2[i]) / 2);
    }
  },
  ...rest
}));

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
        x: "type",
        y: "value",
        fill: "race",
        curve: "monotone-x",
        sort: (d,i) => i,
        rank
      }),
      
      // dashed lines
      Plot.line(data.flatMap(d => d.type === "police" ? [{...d, type:"-"}, d] : [d, {...d, type:"+"}]), 
      selectY(Plot.stackY({
        x: "type",
        y: "value",
        z: "race",
        rank,
        stroke: "black", curve: "monotone-x", strokeWidth: 0.5,
        position: "center",
        strokeDasharray: [5, 5]
      }), "middle")),
      
      // top black lines
      Plot.line(data.flatMap(d => d.type === "police" ? [{...d, type:"---"}, d] : [d, {...d, type:"+++"}]), selectY(Plot.stackY({
        x: "type",
        y: "value",
        z: "race",
        rank,
        stroke: "black", curve: "monotone-x", strokeWidth: 2
      }), "top")),
  
      // bottom black line
      Plot.line([{ type:"---" }, { type: "+++" }], {
        x: "type",
        y: () => 0,
        stroke: "black", strokeWidth: 2
      }),
  
      // text
      Plot.text(data.map(d => ({...d, type: d.type === "police" ? "--" : "++"})),
        selectY(Plot.stackY({
          x: "type",
          y: "value",
          z: "race",
          rank,
          text: d => `${d.race} ${d.value}%`
        }), "middle")
      )
    ],
    marginBottom: 12
  });
}
