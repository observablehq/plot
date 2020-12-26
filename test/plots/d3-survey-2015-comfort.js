import {json} from "d3-fetch";
import {chooseOne} from "./d3-survey-2015";

export default async function() {
  const responses = await json("data/d3-survey-2015.json");
  return chooseOne(responses, "comfort", "How comfortable are you with d3 now?");
  // return chooseOne(responses, "comfort", "How comfortable are you with d3 now?");
  // return chooseOne(responses, "forloops", "Are you comfortable with for loops?");
  // return chooseOne(responses, "trig", "Do you remember trigonometry?");
  // return chooseOne(responses, "gestalt", "Does the word gestalt mean anything to you?");
  // return chooseOne(responses, "tools", "What is your favorite tool for data visualization so far?");
  // return chooseOne(responses,  "feature", "Which feature of d3 get you most excited?");
  // return chooseOne(responses, "city", "What city are you in?");
}
