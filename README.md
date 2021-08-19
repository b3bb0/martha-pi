# martha-pi
Martha mushroom grow room on raspberry-pi - *Cheap & practical martha automation to grow mushrooms*

![Fritz](public/images/fritz.png?raw=true)


## Usage

### **install**
```
git clone https://github.com/b3bb0/martha-pi
cd martha-pi
npm i
```

### **first run**
```
node app.js
```
Then visit http://127.0.0.1:3000

![configuration page](public/images/screenshot.png?raw=true)

## Materials
- 1 raspberry pi, any will work, the cheaper the better!
- 2 x srd-05vdc-sl-c [ebay](https://www.ebay.com.au/itm/362335120644)
- 2 x electrical socket (to wire to the SSR relay)
- 1 waterproof 12v fan [ebay](https://www.ebay.com.au/itm/363486390619)
- 1 12v power supply (for the fan)
- 1 Martha or similar greenhouse tent [on ebay](https://www.ebay.com.au/itm/392080444618)
- 1 Terrarium humidifier [ebay](https://www.ebay.com.au/itm/333735855143)
- 1 DHT sensor module [ebay](https://www.ebay.com.au/itm/393364777777)
- some pin cables & a breadboard


## Credits & Dependencies
First and foremost Paul Stamets for all his amazing work and sharing his knowledge!
- raspberry-node GPIO [onoff](https://github.com/fivdi/onoff)
- raspberry-node DHT sensor [node-dht-sensor](https://github.com/momenso/node-dht-sensor)
