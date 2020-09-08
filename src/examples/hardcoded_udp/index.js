var config = require("../../config/config.json");
const {
  sendRepeatedUDPMessageFromBase64,
  closeUDPClient,
} = require("../../util/udp");

const messageAmount = config.messageAmount;

async function hardcodedUDP() {
  await sendRepeatedUDPMessageFromBase64(messageAmount);
  console.log("All hardcoded UDP messages are sent");
  closeUDPClient();
}

hardcodedUDP();
