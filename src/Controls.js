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

        // initialize sensor
        if (this.conf.sensor && this.conf.sensor.gpio && this.conf.sensor.type!="none") {
            this._initSensor();
        }

        // initialize extraction fan
        if (this.conf.extractionFan && this.conf.extractionFan.gpio) {
            this.extractionFan = new Gpio(this.conf.extractionFan.gpio, 'out');
            this.extractionFan.writeSync(OFF);
        }

        // initialize mister
        if (this.conf.mister && this.conf.mister.gpio) {
            this.mister = new Gpio(this.conf.mister.gpio, 'out');
            this.mister.writeSync(OFF);
        }
        
        var self = this;
        setInterval(function() {
            self._mituteLoop();
        },10000); // 10 seconds instead 1 minute (for testing)
    }

    updateConf() {
        this._debug(2,"reloading configuration");
        // save configuration to json file
        fs.writeFileSync('config.json',JSON.stringify(this.conf));

        if (this.conf.sensor.type==="none") {
            // destroy previous sensor
            this.sensor = null;
        }
        if (this.conf.sensor.type!=="none") {
            // initialize sensor
            if (!this.sensor) this._initSensor();
        }
    }

    _initSensor() {
        this.sensor = Sensor;
        Sensor.initialize(this.conf.sensor.type, this.conf.sensor.gpio);
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
                this.counter.fan++;
            }
        }

        // check mister
        if (this.mister) {
            let mistStatus = this.mister.readSync();
            if (mistStatus===ON && this.counter.mist>=this.conf.mister.minutesOn) {
                this.counter.mist = 0;
                this.mister.writeSync(OFF);
                this._debug(6,"Turning mister OFF");
            } else if (mistStatus===OFF && this.counter.mist>=this.conf.mister.minutesOff) {
                this.counter.mist = 0;
                this.mister.writeSync(ON);
                this._debug(6,"Turning mister ON");
            }
        }
        
    }
    readSensor() {
        return this.sensor.read(this.conf.sensor.type, this.conf.sensor.gpio);
    }
    
    _debug(level,message) {
        if (level>DEBUGLEVEL) return;
        console.log(this._getDate() +` > [${level}] ${message}`);
    }

    _getDate() {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        
        return year + "-" + month + "-" + date + " " + (hours<=9?"0":"")+hours + ":" + (minutes<=9?"0":"")+minutes + ":" + (seconds<=9?"0":"")+seconds;
    }

/*
    _startHumidityMonitor() {
        this._debug(6,"starting humidity monitor every 2 seconds");
        clearInterval(this.misterTimer);
        var self = this;
        this.humidityTimer = setInterval(function() {
            self.sensor.read(self.conf.sensor.type, self.conf.sensor.gpio, function(r) {
                if (r.humidity >= this.conf.humidity.max) {
                    self.turnMister(0);
                } else if (r.humidity <= self.conf.humidity.min) {
                    self.turnMister(1);
                }
            });
        }, 2000);
    }
*/
}

module.exports = Controls;  