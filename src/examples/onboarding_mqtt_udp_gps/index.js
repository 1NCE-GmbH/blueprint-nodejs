const { callOnboarding, getAWSRootCA } = require("../../util/http");
const {
  makeLinesFromCSV,
  stringToBytesGPSExample,
} = require("../../util/template");
const { sendUDPMessage, closeUDPClient } = require("../../util/udp");
const { subscribeMQTTTopic } = require("../../util/mqtt");

var config = require("../../config/config.json");
const {messageAmount, gpsCsvFilePath} = config.udp;

async function onboardingMQTTUDP() {
  // holds state attributes, like counter
  let state = {
    counter: 0,
    receivedAmount: 0,
  };
  const onboardingResult = await callOnboarding();
  const CACallResult = await getAWSRootCA(onboardingResult);
  subscribeMQTTTopic(
    CACallResult,
    CACallResult.iccid + "/messages",
    () => {
      // connected to MQTT lets start sending UDP
      makeLinesFromCSV(state, gpsCsvFilePath, (line) => {
        let arr = stringToBytesGPSExample(line);
        sendUDPMessage(arr).then(() => {
          state.counter--;
          if (!state.counter) {
            closeUDPClient();
          }
        });
      });
    },
    (device, topic, payload) => {
      state.receivedAmount++;
      console.log(
        `=====================================================================================`
      );
      console.log(
        `Received MQTT message No. ${
          state.receivedAmount
        }, from topic: ${topic}, with content : ${payload.toString()}`
      );
      console.log(
        `======================================================================================`
      );
      if (state.receivedAmount !== messageAmount) {
        // not all expected messages received yet so skipping disconnect logic
        return;
      }
      console.log("Disconnecting from MQTT");
      device.end(false, (res) => {
        console.log("device disconnected with res: ", res);
      });
    }
  );
}

// execute end to end test
onboardingMQTTUDP();
