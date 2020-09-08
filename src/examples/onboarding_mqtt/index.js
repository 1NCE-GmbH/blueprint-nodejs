const { callOnboarding, getAWSRootCA } = require("../../util/http.js");
const { subscribeMQTTTopic } = require("../../util/mqtt");

async function onboarding() {
  const onboardingResult = await callOnboarding();
  const CACallResult = await getAWSRootCA(onboardingResult);
  const topic = `${CACallResult.iccid}/messages`;
  subscribeMQTTTopic(
    CACallResult,
    topic,
    (device) => {
      console.log(
        `Publishing message: 'Hello from device !' to topic ${topic} `
      );
      device.publish(topic, "Hello from device !");
      console.log("Message published");
    },
    (device, recTopic, payload) => {
      console.log(
        `=====================================================================================`
      );
      console.log(
        `Received MQTT message, from topic: ${recTopic}, with content : ${payload.toString()}`
      );
      console.log(
        `======================================================================================`
      );
      console.log("Disconnecting from MQTT");
      device.end(false, (res) => {
        console.log("device disconnected with res: ", res);
      });
    }
  );
}

onboarding();
