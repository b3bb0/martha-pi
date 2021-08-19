const PIN = 26
var Gpio = require('onoff').Gpio;
var relay = new Gpio(PIN, 'out');
relay.writeSync(1);