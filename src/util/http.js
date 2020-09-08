const https = require("https");
const config = require("../config/config.json");
const onboardingUrl = config.onboardingUrl;

function printResponseHeaderBody(res) {
  console.log("=========================================================");
  console.log("STATUS: " + res.statusCode);
  console.log("=========================================================");
  console.log("HEADERS: " + JSON.stringify(res.headers));
  console.log("=========================================================");
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        printResponseHeaderBody(res);
        if (res.statusCode !== 200) {
          reject("Response is not 200");
        }
        res.setEncoding("utf8");
        res.on("data", (body) => {
          console.log("BODY: ", body);
          resolve(body);
        });
      })
      .end();
  });
}

async function callOnboarding() {
  console.log("Calling onboarding for URL: ", onboardingUrl);
  const result = await get(onboardingUrl);
  return JSON.parse(result);
}

async function getAWSRootCA(onboardingResp) {
  if (!onboardingResp || !onboardingResp.amazonRootCaUrl) {
    throw Error("amazonRootCaUrl is missing");
  }
  console.log("Getting AWS root CA by URL: ", onboardingResp.amazonRootCaUrl);
  const result = await get(onboardingResp.amazonRootCaUrl);
  onboardingResp.amazonRootCa = result;
  return onboardingResp;
}

module.exports = { callOnboarding, getAWSRootCA };
