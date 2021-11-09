const exec = require('child_process').exec;

const TERMUX_LOCATION_COMMAND = `termux-location `;



function runTermuxLocation(provider, requestType, timeout) {
    return new Promise((resolve, reject) => {

        const locationExec = exec(
            TERMUX_LOCATION_COMMAND + ` -p ${provider} -r ${requestType}`,
            function (error) {
                if (error !== null) {
                    console.error("done with error", error);
                    reject(error);
                } else {
                    console.log("execution end");
                }
            }
        );

        let to = setTimeout(function (locationExec) {
            console.log("killing process due to timeout");
            locationExec.kill();
        }, timeout, locationExec);

        locationExec.stdout.on("data", chunk => {
            console.log("Received location data: ", chunk);
            resolve(chunk);
        });

        locationExec.stderr.on("data", chunk => {
            console.log("Error: ", chunk);
            reject(chunk);
        });

        locationExec.stderr.on("close", () => {
            clearTimeout(to);
            reject(new Error("closed"));
        });
    });


}

module.exports = {
    runTermuxLocation
};
