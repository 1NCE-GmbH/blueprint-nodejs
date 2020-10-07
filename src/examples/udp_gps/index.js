var config = require("../../config/config.json");
const gpsCsvFilePath = config.udp.gpsCsvFilePath;
const { closeUDPClient, sendUDPMessage } = require("../../util/udp");
const {
  makeLinesFromCSV,
  stringToBytesGPSExample,
} = require("../../util/template");

function udpTemplate() {
  // holds state attributes, like counter
  let state = {
    counter: 0,
  };
  makeLinesFromCSV(state, gpsCsvFilePath, (line) => {
    let arr = stringToBytesGPSExample(line);
    sendUDPMessage(arr).then(() => {
      state.counter--;
      if (!state.counter) {
        closeUDPClient();
      }
    });
  });
}

udpTemplate();
