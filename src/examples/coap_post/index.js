const config = require("../../config/config.json");
const { coapPost } = require("../../util/coap");
const {messageAmount, postPayload} = config.coap;

async function postToCoap() {
  console.log(`Will send ${messageAmount} of COAP POST requests`);
  for(let i = 0; i< messageAmount; i++){
    try {
      console.log("---------------------------------------------------------");
      console.log(`Sending COAP message No. ${i}`);
      console.log("---------------------------------------------------------");
      const result = await coapPost(JSON.stringify(postPayload));
      // result is json object with resp code and body contents
      // so we have to stringify it to print to console
      const respJson = JSON.stringify(result);
      console.log(respJson);
    } catch (e) {
      console.error("Error during COAP request:", e);
    }
  }
  
}

postToCoap();
