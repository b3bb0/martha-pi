/**
 * @package Martha-pi
 * @author Alberto bebbo Capponi <bebbo@bebbo.it>
 * @description main server app 
 */

const fs = require("fs");
var Sensor = require("node-dht-sensor"); // https://www.npmjs.com/package/node-dht-sensor
var Gpio = require('onoff').Gpio; // https://www.npmjs.com/package/onoff

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
            this._debug(9,"init fan");
            this.turnExtractionFan(0);
        }

        // initialize mister
        if (this.conf.mister && this.conf.mister.gpio) {
            this.mister = new Gpio(this.conf.mister.gpio, 'out');
            this._debug(9,"init mister");
            this.turnMister(0);
        }

        
        // start loops
        if (this.sensor) {
            this._startHumidityMonitor();
        } else {
            this._startMisterTimerLoop();
        }

        this._startExtractionFanTimerLoop();
    }

    turnMister(status) {
        if (!this.mister) return ;
        this._debug(9,"mister is now "+status);
        if (status===0) status = 1; else status = 0;
        this.mister.writeSync(status); // inverted on raspberry
    }

    turnExtractionFan(status) {
        if (!this.extractionFan) return ;
        this._debug(9,"fan is now "+status);
        if (status===0) status = 1; else status = 0;
        this.extractionFan.writeSync(status); // inverted on raspberry
    }

    updateConf() {
        this._debug(2,"reloading configuration");
        // save configuration to json file
        fs.writeFileSync('config.json',JSON.stringify(this.conf));

        if (this.conf.sensor.type==="none") {
            // destroy previous sensor
            this.sensor = null;
            this._startMisterTimerLoop();
        }
        if (this.conf.sensor.type!=="none") {
            // initialize sensor
            if (!this.sensor) this._initSensor();
            this._startHumidityMonitor();
        }

        this._startExtractionFanTimerLoop();
    }

    _initSensor() {
        this.sensor = Sensor;
        Sensor.initialize(this.conf.sensor.type, this.conf.sensor.gpio);
    }

    /** Loop to read humidity and start/stop the mister */
    _startHumidityMonitor() {
        clearInterval(this.misterTimer);
        this.humidityTimer = setInterval(function() {
            this.sensor.read(this.conf.sensor.type, this.conf.sensor.gpio, function(r) { 
                if (r.humidity >= this.conf.humidity.max) {
                    this.turnMister(0);
                } else if (r.humidity <= this.conf.humidity.min) {
                    this.turnMister(1);
                }
            });
        }, 2000);
    }

    /** Loop to start/stop the mister on time base */
    _startMisterTimerLoop() {
        clearInterval(this.humidityTimer);
        this.misterTimer = setInterval(function() {
            this.turnMister(1);
            setTimeout(function() {
                this.turnMister(0);
            },this.conf.mister.minutesOn * 60 * 1000);
        }, (this.conf.mister.minutesOff + this.conf.mister.minutesOn) * 60 * 1000 );
    }

    /** Loop to start/stop the extraction fan */
    _startExtractionFanTimerLoop() {
        this._debug(6,"starting extraction fan timer "+(this.conf.extractionFan.minutesOff + this.conf.extractionFan.minutesOn));
        clearInterval(this.extractionTimer);
        var self = this;
        this.extractionTimer = setInterval(function() {
            self._debug(7,"Looping fan ON");
            self.turnExtractionFan(1);
            setTimeout(function() {
                self._debug(7,"Looping fan OFF");
                self.turnExtractionFan(0);
            },self.conf.extractionFan.minutesOn * 60 * 1000);
        }, (this.conf.extractionFan.minutesOff + this.conf.extractionFan.minutesOn) * 60 * 1000 );
    }

    readSensor() {
        return this.sensor.read(this.conf.sensor.type, this.conf.sensor.gpio);
    }
    
    _debug(level,message) {
        console.log(message);
    }
}

module.exports = Controls;  