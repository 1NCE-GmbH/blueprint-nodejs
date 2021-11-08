var api = require('termux-api').default;

let result = api.createCommand()
            .location()
            .fromGPSProvider()
            .requestOnce()
            .build()
            .run();

result.getOutputObject()
.then(function(location) {
    console.log('Last known location: ', location);
});
