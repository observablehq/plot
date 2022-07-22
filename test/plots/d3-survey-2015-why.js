import * as d3 from "d3";
import {chooseMany} from "./d3-survey-2015.js";

export default async function () {
  const responses = await d3.json("data/d3-survey-2015.json");
  return chooseMany(responses, "why", "Why do you want to learn d3?");
  // return chooseMany(responses, "tech", "Have you used any of the following technologies?");
  // return chooseMany(responses, "projects", "What kind of projects do you want to use d3 for?");
  // return chooseMany(responses, "libraries", "Have you used any of the following libraries?");
  // return chooseMany(responses, "format", "Which formats would you be interested in paying for to learn d3?");
}
