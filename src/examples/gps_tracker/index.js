var config = require("../../config/config.json");
const interval = config.location.intervalMS;
const provider = config.location.provider;
const requestType = config.location.requestType;
const { closeUDPClient, sendUDPMessage } = require("../../util/udp");
const { runTermuxLocation } = require("../../util/termuxLocationWrapper");
const { encodeLocation } = require("../../util/locationEncode");

async function sendLocationData() {
  while(true) {
    console.log("Trying to send location data to UDP");
    try{
      const receivedData = await runTermuxLocation(provider, requestType, interval);
      if(receivedData) {
        const locationObject = JSON.parse(receivedData);
        const encodedData = encodeLocation(locationObject);
        sendUDPMessage(encodedData).then(() => {
          console.log("UDP message sent");
        });

      }
      console.log(receivedData);
    }catch(error) {
      console.error(error);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  closeUDPClient();
}

sendLocationData();
