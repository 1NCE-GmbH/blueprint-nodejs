"use strict";

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
  let arr = [];
  if (sense && template.sense) {
    for (let i = 0, len = template.sense.length; i < len; i++) {
      let element = template.sense[i];
      if (!element.asset) {
        if (element.switch) {
          processSwitch(element, sense[i], arr);
          continue;
        }
        console.error("element has no asset", element);
        continue;
      }
      if (!element.value) {
        console.log(`${element.asset} has no value, skipping`);
        continue;
      }
      processAsset(element, sense[i], arr);
    }
  }
  return Buffer.concat(arr);
}

function processSwitch(element, val, arr) {
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
        processAsset(o.do[i], val.do[i], arr);
      }
      break;
    }
  }
}

function processAsset({ asset, value }, data, arr) {
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

  arr.push(
    encode(
      data,
      value.type,
      value.bytelength,
      value.byteorder,
      asset
    )
  );
}

function encode(val, type, length, byteorder, fieldName) {
  console.log(
    `+++++++++++++++++++
    Need to encode field ${fieldName} with value "${val}" to type: ${type} of length ${length}, with  byteorder ${byteorder}
    +++++++++++++++++++`
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
      buf = processFloat(buf, val, byteorder, length);
      break;
    case "int":
      buf = processInteger(buf, val, byteorder, length);
      break;
    case "uint":
      buf = processUnsignedInteger(buf, val, byteorder, length);
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

function processUnsignedInteger(buf, val, byteorder, length) {
  if (typeof val === "string") {
    val = Number(val);
  }
  if (length === 1) {
    if (byteorder === "little") {
        buf.writeUIntLE(val);
    } else {
        buf.writeUIntBE(val);
    }
  } else if (length === 2) {
    if (byteorder === "little") {
        buf.writeUInt16LE(val);
    } else {
        buf.writeUInt16BE(val);
    }
  } else if (length === 4) {
    if (byteorder === "little") {
        buf.writeUInt32LE(val);
    } else {
        buf.writeUInt32BE(val);
    }
  } else if (length === 8) {
    if (byteorder === "little") {
        buf.writeBigUInt64LE(val);
    } else {
        buf.writeBigUInt64BE(val);
    }
  }
  return buf;
}

function processInteger(buf, val, byteorder, length) {
  if (typeof val === "string") {
    val = Number(val);
  }
  if (length === 1) {
    if (byteorder === "little") {
        buf.writeIntLE(val);
    } else {
        buf.writeIntBE(val);
    }
  } else if (length === 2) {
    if (byteorder === "little") {
        buf.writeInt16LE(val);
    } else {
        buf.writeInt16BE(val);
    }
  } else if (length === 4) {
    if (byteorder === "little") {
        buf.writeInt32LE(val);
    } else {
        buf.writeInt32BE(val);
    }
  } else if (length === 8) {
    if (byteorder === "little") {
        buf.writeBigInt64LE(val);
    } else {
        buf.writeBigInt64BE(val);
    }
  }
  return buf;
}

function processFloat(buf, val, byteorder, length) {
  if (typeof val === "string") {
    val = Number(val);
  }
  if (length === 4) {
    if (byteorder === "little") {
      buf.writeFloatLE(val);
    } else {
      buf.writeFloatBE(val);
    }
  } else if (length === 8) {
    if (byteorder === "little") {
      buf.writeDoubleLE(val);
    } else {
      buf.writeDoubleBE(val);
    }
  }
  return buf;
}

module.exports = { processSense };
