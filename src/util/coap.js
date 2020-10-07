const coap = require("coap");
const config = require("../config/config.json");
const bl = require("bl");
const {host, port, query, confirmable, reqContentFormat, reqPath} = config.coap;

/**
 * Function expects response object from which is extracted and printed to console
 * parameters like response code, headers, method, etc.
 * @param {*} res 
 */
function printResponseHeaderBody(res) {
  console.log("=========================================================");
  console.log("STATUS: " + res.code);
  console.log("=========================================================");
  console.log("HEADERS: " + JSON.stringify(res.headers));
  console.log("=========================================================");
  console.log("OPTIONS: " + JSON.stringify(res.options));
  console.log("=========================================================");
  console.log("METHOD: " + JSON.stringify(res.method));
  console.log("=========================================================");
  console.log("URL: " + JSON.stringify(res.url));
  console.log("=========================================================");
  console.log("RSINFO: " + JSON.stringify(res.rsinfo));
  console.log("=========================================================");
  console.log("OUTSOCKET: " + JSON.stringify(res.outSocket));
  console.log("=========================================================");
}

/**
 * Calls COAP post request with params from config file
 * @param {*} payload
 */

function coapPost(payload) {
  return new Promise((resolve, reject) => {
    const coapTiming = {
      ackTimeout: 2, //seconds
      ackRandomFactor: 1.0,
      maxRetransmit: 2,
      maxLatency: 2,
      piggybackReplyMs: 10,
    };
    coap.updateTiming(coapTiming);
    const reqConfig = {
      host: host,
      port: port,
      method: "POST",
      pathname: reqPath,
      query: query,
      confirmable: confirmable,
      options: {
        "Content-Format": reqContentFormat,
      },
    };
    console.log("Calling COAP POST with following request object: ", reqConfig);
    let req = coap.request(reqConfig);
    req = addPayloadToRequest(req, payload, reqContentFormat);
    req.on("response", function (res) {
      console.log(
        "==============COAP Response received @",
        new Date().toISOString()
      );
      printResponseHeaderBody(res);
      // always try to get response body even if response code is not 2.01 (success),
      // because it can contain description of error
      res.pipe(
        bl(function (err, data) {
          if (err) {
            reject(err);
            return;
          }
          console.log("RESP BODY LENGTH: " + data.length);
          console.log(
            "========================================================="
          );
          if (res.code !== "2.04") {
            // hopefully error responses always are in text format
            // so we can call .toString() on buffer and get text
            const error = generateResponseOj(res.code, data.toString());
            reject(error);
            return;
          }
          //we don't know in which format data buffer object incoming, so returning buffer instance
          const responseObj = generateResponseOj(res.code, data);
          resolve(responseObj);
        })
      );
    });
    console.log(
      "==============Sending COAP Request @",
      new Date().toISOString()
    );
    req.end();
  });
}

function generateResponseOj(respCode, body) {
  return {
    code: respCode,
    message: body,
  };
}

/**
 * Function checks provided reqContFormat and based on it adds payload to request object,
 * if format is octet-stream then payload should be provided as Base64 string
 * Possible payload formats: 
 *  text/plain
 *  application/xml
 *  application/octet-stream
 *  application/json
 * @param {*} request 
 * @param {*} payload 
 * @param {*} reqContFormat 
 */
function addPayloadToRequest(request, payload, reqContFormat) {
  if (!payload) {
    console.log("Payload missing nothing added to request");
    return request;
  }
  try {
    switch (reqContFormat) {
      case "application/octet-stream":
        
        const binaryData = Buffer.from(payload, "base64");
        request.write(binaryData);
        break;
      case "application/xml":
      case "application/json":
      case "text/plain":
        request.write(payload);
        break;
      default:
        throw new Error("Unsupported request content format " + reqContFormat);
    }
  } catch (e) {
    console.error("Error during attempt to add payload to COAP request: ", e);
    throw e;
  }
  return request;
}

module.exports = { coapPost };
