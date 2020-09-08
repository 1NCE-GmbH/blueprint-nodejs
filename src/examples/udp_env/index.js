var config = require("../../config/config.json");
const envCsvFilePath = config.envCsvFilePath;
const { closeUDPClient, sendUDPMessage } = require("../../util/udp");
const {
  makeLinesFromCSV,
  stringToBytesEnvExample,
} = require("../../util/template");

function udpTemplate() {
  // holds state attributes, like counter
  let state = {
    counter: 0,
  };
  makeLinesFromCSV(state, envCsvFilePath, (line) => {
    let arr = stringToBytesEnvExample(line);
    sendUDPMessage(arr).then(() => {
      state.counter--;
      if (!state.counter) {
        closeUDPClient();
      }
    });
  });
}

udpTemplate();
