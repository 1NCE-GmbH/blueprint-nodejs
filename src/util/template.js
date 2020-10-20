const config = require("../config/config.json");
const { processSense } = require("./templateEncode");
const fs = require("fs");
const readline = require("readline");
const gpsTemplate = require(config.udp.gpsTemplatePath);

const envTemplate = require(config.udp.envTemplatePath);

function makeLinesFromCSV(state, filePath, callback) {
  if (!filePath) {
    throw Error("CSV file path not provided");
  }
  console.log("Reading data from path: " + filePath);
  let lineReader = readline.createInterface({
    input: fs.createReadStream(filePath),
  });
  lineReader.on("line", (line) => {
    //console.log('Line from file:', line);
    state.counter++;
    if (callback) {
      callback(line);
    }
  });
  lineReader.on("close", () => {
    console.log("All lines in file processed.");
  });
}

function stringToBytesGPSExample(line) {
  let spl = line.split(",");
  let sense = [];
  if (spl[0] === "T") {
    sense.push("T");
    sense.push({
      case: "T",
      do: [null, ...spl.slice(1, spl.length)],
    });
  } else if (spl[0] === "S") {
    sense.push("S");
    sense.push({
      case: "S",
      do: [null, spl[1]],
    });
  }
  return processSense({ sense }, gpsTemplate);
}

function stringToBytesEnvExample(line) {
  let sense = [null, ...line.split(",")];
  return processSense({ sense }, envTemplate);
}

module.exports = {
  makeLinesFromCSV,
  stringToBytesGPSExample,
  stringToBytesEnvExample,
};
