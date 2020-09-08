"use strict";

let arr;

/*
 * for gps_template example, these are two possible sense object formats
 * that can be passed to this file

let exampleT = {
    sense: [
        "T",
        "SUX",
        {
            case: "T",
            do: [
                null,
                "1234567890123456789",
                123.123,
                234.234,
                123,
                345.345,
                456.456,
                567.567,
                234,
                345,
                456,
                "string",
                "long description"
            ]
        }
    ]
}
let exampleS = {
    sense: [
        "S",
        "SUX",
        {
            case: "S",
            do: [
                null,
                "Value string"
            ]
        }
    ]
}
*/

/**
 * make byte buffer from an object
 * @param {*} param0 object in format like in comment above (currently supports sense), loosely based on the template format
 * @param {*} template template json
 */
function processSense({ sense }, template) {
  arr = [];
  if (sense && template.sense) {
    for (let i = 0, len = template.sense.length; i < len; i++) {
      let element = template.sense[i];
      if (!element.asset) {
        if (element.switch) {
          processSwitch(element, sense[i]);
          continue;
        }
        console.error("element has no asset", element);
        continue;
      }
      if (!element.value) {
        console.log(`${element.asset} has no value, skipping`);
        continue;
      }
      processAsset(element, sense[i]);
    }
  }
  return Buffer.concat(arr);
}

function processSwitch(element, val) {
  console.log(
    `processing switch at position ${element.switch.byte} with case ${val.case}`
  );
  if (!element.on || !element.on.length) {
    console.error(`switch at ${element.switch.byte} doesn't have on block`);
    return;
  }
  for (let o of element.on) {
    if (o.case === val.case) {
      for (let i = 0, len = o.do.length; i < len; i++) {
        processAsset(o.do[i], val.do[i]);
      }
      break;
    }
  }
}

function processAsset({ asset, value }, data) {
  if (typeof value === "string") {
    console.log(`informative asset ${value}`);
    return;
  }
  if (!value.type) {
    console.error(`no value type for asset ${asset}`);
    return;
  }
  if (!value.bytelength) {
    value.bytelength = 1;
  }

  arr.push(encode(data, value.type, value.bytelength, asset));
}

function encode(val, type, length, fieldName) {
  console.log(
    `need to encode field ${fieldName} with value ${val} to ${type} of length ${length}`
  );
  let buf = Buffer.alloc(length);
  if (!val) {
    return buf;
  }
  switch (type) {
    case "string":
      buf.write(val);
      break;
    case "float":
      if (typeof val === "string") {
        val = Number(val);
      }
      if (length === 4) {
        buf.writeFloatBE(val);
      } else if (length === 8) {
        buf.writeDoubleBE(val);
      }
      break;
    case "int":
      if (typeof val === "string") {
        val = Number(val);
      }
      if (length === 1) {
        buf.writeInt8(val);
      } else if (length === 2) {
        buf.writeInt16BE(val);
      } else if (length === 4) {
        buf.writeInt32BE(val);
      } else if (length === 8) {
        buf.writeBigInt64BE(val);
      }
      break;
    case "boolean":
      if (val && val !== "0") {
        buf.writeInt8(1);
      }
      break;
    default:
      throw Error(`Unrecognized/Unsupported value type ${typeof val}`);
  }
  return buf;
}

module.exports = { processSense };
