var Sensor = require("node-dht-sensor"); // https://www.npmjs.com/package/node-dht-sensor

Sensor.read(22, 4, function(err,temp,humi) {
    console.log('err',err);
    console.log('temp',temp);
    console.log('humi',humi);
    
});
