
function encodeLocation(data, length = 16) {

    console.log(
      `+++++++++++++++++++
      Need to encode data ${JSON.stringify(data)} with length ${length}
      +++++++++++++++++++`
    );
    
    if (!data || !data.latitude || !data.longitude) {
      throw Error("Missing data or latitude or longitude inside data");
    }
    const latBuff = processFloat(data.latitude, "little", 8);
    const longBuff = processFloat(data.longitude, "little", 8);
    return Buffer.concat([latBuff, longBuff]);
  }
  
  function processFloat(val, byteorder, length) {
    let buf = Buffer.alloc(8);
    console.log(`Processing Float value: ${val}`);
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
  
  module.exports = { encodeLocation };
  