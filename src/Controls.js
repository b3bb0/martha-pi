/**
 * @package Martha-pi
 * @author Alberto bebbo Capponi <bebbo@bebbo.it>
 * @description main server app 
 */

const fs = require("fs");
var Sensor = require("node-dht-sensor"); // https://www.npmjs.com/package/node-dht-sensor
var Gpio = require('onoff').Gpio; // https://www.npmjs.com/package/onoff

var DEBUGLEVEL = 9;

const ON = 0;
const OFF = 1;

class Controls {

    constructor() {
        
        this.conf = {
            sensor: {
                gpio: 4,
                type: "none" // ("none"  |  11 = DHT11  |  22 = DMT22 )
            },
            extractionFan: {
                gpio: 17,
                minutesOn: 1,
                minutesOff: 3
            },
            mister: {
                gpio: 18,
                minutesOn: 5,
                minutesOff: 20
            },
            humidity: {
                min: 85,
                max: 95
            }
        };

        this.counter = {
            monitor: 0,
            fan: 0,
            mist: 0
        }

        // load previous configuration form config file
        if (fs.existsSync('config.json')) {
            this.conf = JSON.parse(fs.readFileSync('config.json'));
        }
        
    }

    init() {

        this._debug(2,'Booting...');

        // initialize sensor
        if (this.conf.sensor && this.conf.sensor.gpio && this.conf.sensor.type!="none") {
            this.sensor = Sensor;
        } else {
            this.sensor = null;
        }

        // initialize extraction fan
        if (this.conf.extractionFan && this.conf.extractionFan.gpio) {
            this.extractionFan = new Gpio(this.conf.extractionFan.gpio, 'out');
            this.extractionFan.writeSync(OFF);
        } else {
            this.extractionFan = null;
        }

        // initialize mister
        if (this.conf.mister && this.conf.mister.gpio) {
            this.mister = new Gpio(this.conf.mister.gpio, 'out');
            this.mister.writeSync(OFF);
        } else {
            this.mister = null;
        }

        this._debug(2,'Initialization completed');
    }

    run() {
        this._mituteLoop();

        var self = this;
        setInterval(function() {
            self._debug(9,'looping...');
            self._mituteLoop();
        },60000); // 1 minute loop

        setInterval(function() {
            self._secondsLoop();
        },5000); // 5 seconds
    }

    updateConf() {
        this._debug(3,"reloading configuration");

        // save configuration to json file
        fs.writeFileSync('config.json',JSON.stringify(this.conf));

        // re-initialize
        this.init();
    }

    _mituteLoop() {
        // check fan
        if (this.extractionFan) {
            let fanStatus = this.extractionFan.readSync();
            if (fanStatus===ON && this.counter.fan>=this.conf.extractionFan.minutesOn) {
                this.counter.fan = 0;
                this.extractionFan.writeSync(OFF);
                this._debug(6,"Turning fan OFF");
            } else if (fanStatus===OFF && this.counter.fan>=this.conf.extractionFan.minutesOff) {
                this.counter.fan = 0;
                this.extractionFan.writeSync(ON);
                this._debug(6,"Turning fan ON");
            } else {
                ++this.counter.fan;
            }
        }

        // check mister (if not running via sensor)
        if (this.mister && !this.sensor) {
            let mistStatus = this.mister.readSync();
            if (mistStatus===ON && this.counter.mist>=this.conf.mister.minutesOn) {
                this.counter.mist = 0;
                this.mister.writeSync(OFF);
                this._debug(6,"Turning mister OFF (timer)");
            } else if (mistStatus===OFF && this.counter.mist>=this.conf.mister.minutesOff) {
                this.counter.mist = 0;
                this.mister.writeSync(ON);
                this._debug(6,"Turning mister ON  (timer)");
            } else {
                ++this.counter.mist;
            }
        }
    }

    _secondsLoop() {
        if (!this.sensor) return;
        var self = this;
        this.sensor.read(this.conf.sensor.type, this.conf.sensor.gpio, function(err,temp,humi) {
            if (err) {
                self._debug(1,"Error reading from sensor",err);
                return;
            }
            if (humi >= self.conf.humidity.max) {
                self._debug(6,"Turning mister OFF (sensor) humidity is "+humi);
                self.mister.writeSync(OFF);
            } else if (humi <= self.conf.humidity.min) {
                self._debug(6,"Turning mister ON  (sensor) humidity is "+humi);
                self.mister.writeSync(ON);
            }
        });
    }

    readSensor() {
        return this.sensor.read(this.conf.sensor.type, this.conf.sensor.gpio);
    }
    
    _debug(level,message) {
        if (level>DEBUGLEVEL) return;

        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        
        let dateFormat = year + "-" + month + "-" + date + " " + (hours<=9?"0":"")+hours + ":" + (minutes<=9?"0":"")+minutes + ":" + (seconds<=9?"0":"")+seconds;

        var type = 'ERROR';
        if (level>3) {
            type = 'DEBUG-'+level;
        } else if (level>1) {
            type = 'INFO';
        }

        console.log(`${dateFormat} > [${type}] ${message}`);
    }
}

module.exports = Controls;  