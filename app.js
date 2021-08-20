/**
 * @package Martha-pi
 * @author Alberto bebbo Capponi <bebbo@bebbo.it>
 * @description main server app 
 */

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const Controls = require('./src/Controls');

var martha = new Controls();

martha.init();

martha.run();

setInterval(function() {
    fs.appendFile('logs.csv', Date.now()+","+martha.humidity+","+martha.temperature+"\n", function (err) {
        if (err) console.log(err);
    });
},1000 * 60); // get

var web = http.createServer(function (req, res) {

    // get configuration
    if (req.method === "GET" && req.url=="/conf.json") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(martha.conf));
        return;
    }

    if (req.method === "GET" && req.url=="/logs.csv") {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream("./logs.csv", "UTF-8").pipe(res);
        return;
    }

    // save configuration
    if (req.method === "POST" && req.url=="/conf.html") {
        
        var body = "";
        req.on("data", function (chunk) { body += chunk; });

        req.on("end", function(){
            var x = querystring.parse(body);
            martha.conf.mister.gpio = parseInt(x.misterGPIO);
            martha.conf.mister.minutesOn = parseInt(x.misterOn);
            martha.conf.mister.minutesOff = parseInt(x.misterOff);

            martha.conf.extractionFan.gpio = parseInt(x.fanGPIO);
            martha.conf.extractionFan.minutesOn = parseInt(x.fanOn);
            martha.conf.extractionFan.minutesOff = parseInt(x.fanOff);

            martha.conf.humidity.min = parseInt(x.minRH);
            martha.conf.humidity.max = parseInt(x.maxRH);

            martha.conf.sensor.gpio = parseInt(x.sensorGPIO);
            martha.conf.sensor.type = (x.sensorType!="none"?parseInt(x.sensorType):"none");

            martha.updateConf();
        });
    }

    // load existing files automatically [start]
    var use = req.url.replace('../','');
    if (use === "/") use = '/index.html';

    if (fs.existsSync('./public'+use)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream("./public"+use, "UTF-8").pipe(res);
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end('Not found :/');
    }
    // load existing files automatically [stop]

}).listen(80);

