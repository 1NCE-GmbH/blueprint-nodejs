const dgram = require("dgram");

const udpClient = dgram.createSocket("udp4");

var config = require("../config/config.json");

const udpAddr = config.udpAddr;
const udpPort = config.udpPort;

const sleep = config.sleep; // ms to sleep between messages (0 = burst mode)
const udpMessage = config.udpMessageBase64;

udpClient.on("error", (err) => {
  console.log(`udpClient error:\n${err.stack}`);
  server.close();
});

udpClient.on("message", (msg, rinfo) => {
  console.log(`udpClient got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

udpClient.on("listening", () => {
  const address = udpClient.address();
  console.log(`udpClient listening ${address.address}:${address.port}`);
});

udpClient.on("close", () => {
  console.log(`udpClient closed`);
});

function sendUDPMessage(message) {
  return new Promise((resolve, reject) => {
    udpClient.send(message, udpPort, udpAddr, (err) => {
      console.log("UDP Message sent");
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function closeUDPClient() {
  if (udpClient) {
    udpClient.close();
    console.log("UDP client Close called!");
  }
}

async function sendRepeatedUDPMessageFromBase64(amount) {
  console.log("Sending to UDP address: " + udpAddr);
  const message = Buffer.from(udpMessage, "base64");
  for (let i = 0; i < amount; i++) {
    await sendUDPMessage(message);
    await new Promise((resolve) => setTimeout(resolve, sleep));
  }
}

module.exports = {
  sendUDPMessage,
  closeUDPClient,
  sendRepeatedUDPMessageFromBase64,
};
