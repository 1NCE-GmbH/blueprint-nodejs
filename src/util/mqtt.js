const awsIot = require("aws-iot-device-sdk");

/**
 * Function connects to AWS IOT core MQTT using provided parameters, which can be retrieved during onboarding call
 * @param {*} iccid - unique identifier of sim, which will be used as clientId on mqtt connection, should be in onboarding reponse
 * @param {*} iotCoreEndpointUrl - URL of AWS IOT Core to which to connect, should be in onboarding reponse
 * @param {*} privateKey - private key for AWS IOT core connection, should be in onboarding response
 * @param {*} amazonRootCa - AWS root certificate, which must be retrieved separately using URL provided in onboarding response
 * @param {*} certificate - AWS IOT client certificate, which is retreived during onboarding call
 * @param {*} topic - topic name to which to subscribe
 * @param {*} onConnect - callback which is executed when MQTT client has connected
 * @param {*} onMessage - callback which is executed when MQTT client retrieves new message from topic
 */
function subscribeMQTTTopic(
  { iccid, iotCoreEndpointUrl, privateKey, amazonRootCa, certificate },
  topic,
  onConnect,
  onMessage
) {
  if (!iccid) {
    throw Error("subscribeMQTTTopic onboardingResp.iccid null");
  }
  if (!iotCoreEndpointUrl) {
    throw Error("subscribeMQTTTopic onboardingResp.iotCoreEndpointUrl null");
  }
  if (!privateKey) {
    throw Error("subscribeMQTTTopic onboardingResp.privateKey null");
  }
  if (!amazonRootCa) {
    throw Error("subscribeMQTTTopic onboardingResp.amazonRootCa null");
  }
  if (!certificate) {
    throw Error("subscribeMQTTTopic onboardingResp.certificate null");
  }
  if (!topic) {
    throw Error("subscribeMQTTTopic topic null");
  }
  if (!onConnect) {
    throw Error("subscribeMQTTTopic onConnect callback function is null");
  }
  if (!onMessage) {
    throw Error("subscribeMQTTTopic onMessage callback function is null");
  }
  console.log("registering mqtt udpClient device object");
  var device = awsIot.device({
    clientId: iccid,
    host: iotCoreEndpointUrl,
    privateKey: Buffer.from(privateKey),
    caCert: Buffer.from(amazonRootCa),
    clientCert: Buffer.from(certificate),
  });
  console.log("Device udpClient registered");

  device.on("connect", () => {
    device.subscribe(topic);
    console.log(`MQTT subscribed to topic ${topic}`);
    onConnect(device);
  });
  device.on("close", () => {
    console.log("MQTT client connection is closed");
  });
  device.on("reconnect", () => {
    console.log("MQTT client has reconnected");
  });
  device.on("offline", () => {
    console.log("MQTT client is in offline mode");
  });
  device.on("error", (error) => {
    console.error("MQTT client error: ", error);
  });
  device.on("message", (recTopic, payload) => {
    // console.log('message', payload);
    onMessage(device, recTopic, payload);
  });
}

module.exports = { subscribeMQTTTopic };
