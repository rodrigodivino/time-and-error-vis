/*global d3*/
import { cleanData } from "./utils.js";
import { draw } from "./plot.js";

d3.csv("./data/testData.csv", cleanData).then(draw);
