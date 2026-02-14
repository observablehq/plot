// @ts-nocheck — React components importing from untyped JS modules
import React from "react";
import {Link} from "./Link.js";
import {Dot} from "./Dot.js";
import {Text} from "./Text.js";

export interface TreeProps {
  data?: any;
  x?: any;
  y?: any;
  x1?: any;
  y1?: any;
  x2?: any;
  y2?: any;
  text?: any;
  textStroke?: string;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  r?: number;
  dx?: number;
  dy?: number;
  textLayout?: "mirrored" | "normal";
  treeLayout?: "tree" | "cluster";
  className?: string;
  [key: string]: any;
}

// Tree renders a hierarchical tree layout as links + optional dots + optional labels.
// In the imperative API, this uses treeNode/treeLink transforms to compute positions.
// In React, users should apply those transforms to their data first, then provide
// pre-computed x1/y1/x2/y2 for links and x/y for nodes.
export function TreeMark({
  data,
  x,
  y,
  x1,
  y1,
  x2,
  y2,
  text,
  textStroke = "white",
  fill = "none",
  stroke = "#555",
  strokeWidth = 1.5,
  r = 3,
  dx = 6,
  dy,
  className,
  ...rest
}: TreeProps) {
  return (
    <>
      {/* Edges */}
      {(x1 != null || y1 != null) && (
        <Link
          data={data}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          className={className}
          {...rest}
        />
      )}
      {/* Nodes */}
      {x != null && y != null && (
        <Dot data={data} x={x} y={y} r={r} fill={fill} stroke={stroke} className={className} />
      )}
      {/* Labels */}
      {text != null && (
        <Text
          data={data}
          x={x}
          y={y}
          text={text}
          dx={dx}
          dy={dy}
          textAnchor="start"
          stroke={textStroke}
          strokeWidth={3}
          fill="currentColor"
          paintOrder="stroke"
          className={className}
        />
      )}
    </>
  );
}

// Cluster is just Tree with a different layout algorithm (applied via transforms)
export function ClusterMark(props: TreeProps) {
  return <TreeMark treeLayout="cluster" {...props} />;
}
